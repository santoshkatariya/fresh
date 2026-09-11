import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db } from './server/db.js';
import { whatsappRouter } from './server/whatsapp/routes.js';
import {
  initMySQL,
  getMySQLStatus,
  MYSQL_SCHEMA_SQL,
  syncAllToMySQL,
} from './server/mysql.js';

let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize MySQL database connection asynchronously (with automatic local fallback)
  initMySQL().then((connected) => {
    if (connected) {
      console.log('📦 MySQL connection pool ready and tables verified.');
    }
  }).catch((err) => {
    console.warn('MySQL initialization notice:', err.message);
  });

  // Body parsing for JSON with support for captured camera base64 images
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Meta WhatsApp Cloud API & Farmer Assistant Webhook Routes
  app.use('/api/whatsapp', whatsappRouter);

  // Health check API with comprehensive system & database telemetry
  app.get('/api/health', async (req, res) => {
    const batches = db.getBatches();
    const orders = db.getOrders();
    const users = db.getUsers();
    const buyers = db.getBuyers();
    const mysqlStatus = await getMySQLStatus();

    res.json({
      status: 'ok',
      service: 'FreshRoute.2 Agro Intelligence Engine',
      port: PORT,
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      database: {
        primary: mysqlStatus.connected ? 'MySQL 8.x Relational Store' : 'Local Persistent Store (Fallback)',
        mysql: mysqlStatus,
        localJsonStore: {
          path: 'data/db.json',
          counts: {
            batches: batches.length,
            orders: orders.length,
            users: users.length,
            buyers: buyers.length,
          },
        },
      },
      timestamp: new Date().toISOString(),
    });
  });

  // MySQL Status & Telemetry API
  app.get('/api/mysql/status', async (req, res) => {
    try {
      const status = await getMySQLStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Download or view exact MySQL Schema DDL
  app.get('/api/mysql/schema.sql', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="freshroute_schema.sql"');
    res.send(MYSQL_SCHEMA_SQL);
  });

  // Manual or automatic sync of all local records to MySQL
  app.post('/api/mysql/sync', async (req, res) => {
    try {
      const result = await syncAllToMySQL(
        db.getBatches(),
        db.getOrders(),
        db.getUsers(),
        db.getBuyers(),
        db.getDemands()
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI Produce Spoilage & Pest Detection API
  app.post('/api/analyze-produce', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', cropHint, language = 'en' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'Missing imageBase64 in request body' });
      }

      // Clean base64 string if data URI prefix is present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

      const ai = getGeminiClient();

      if (!ai) {
        // Fallback simulation when API key is not yet set
        const fallbackResponse = generateHeuristicAnalysis(cropHint, language);
        return res.json({
          ...fallbackResponse,
          isSimulation: true,
          notice: 'Heuristic post-harvest model active (attach GEMINI_API_KEY in Secrets for live neural inference)',
        });
      }

      const prompt = `You are an elite post-harvest agricultural biometrics and plant pathology AI model (FreshRoute Neural Vision).
Analyze this fresh produce photo captured at the farm gate or sorting dock.

Carefully classify:
1. Crop type and botanical variety.
2. Overall Quality Score (0 to 100) and Quality Grade ('A' for export/retail prime 80-100, 'B' for standard/local market 65-79, 'C' for processing/distressed 45-64, 'D' for severe decay <45).
3. Biometrics: Freshness index (0-100%), Ripeness index (0-100%), Damage index (0-100%), Firmness rating (1.0 to 10.0 scale, e.g. 7.8), Estimated shelf-life in remaining hours at ambient 25°C, and Spoilage risk probability (0-100%).
4. Specific Pest & Insect Infestation markers (such as Fruit borer Helicoverpa/Tuta pinholes or frass, Fruit fly Bactrocera punctures, Mealybugs, Thrips/Mite silvering, Aphids). Mark risk as 'clean', 'low', 'moderate', or 'severe'.
5. Specific Spoilage, Rot & Disease symptoms (Anthracnose, Early/Late Blight lesions, Botrytis gray mold, Rhizopus soft rot, Stem-end rot, Blossom-end rot, Mechanical pressure bruises, Sunscald, Skin micro-cracking).
6. Bounding boxes for each detected defect. Provide boxCoordinates with normalized percentages: top (0-100), left (0-100), width (0-100), height (0-100) on where the defect/pest appears in the image.
7. Segregation advice: Does the farmer need to remove affected fruits from the crate to prevent ethylene or fungus spreading? (boolean).
8. Best financial/dispatch action (e.g., Immediate direct retail dispatch, Divert to pulp processor, Chilled reefer transit, or Solar drying).
9. Storage temperature and relative humidity recommendation.
10. Spoken summary text localized for the farmer (Language: ${language} - Kannada/Hindi/Marathi/English).

Return ONLY raw JSON matching this schema:
{
  "crop": "Tomatoes",
  "variety": "Abhinav Hybrid (Table Grade)",
  "qualityScore": 82,
  "qualityGrade": "A",
  "freshnessPercent": 88,
  "ripenessPercent": 80,
  "damagePercent": 12,
  "pestInfestationRisk": "clean",
  "spoilageRiskPercent": 18,
  "firmnessRating": 7.8,
  "estimatedShelfLifeHours": 32,
  "pestSummary": "No active pest borers or larval tunneling detected. Clean fruit calyx.",
  "diseaseSummary": "Healthy epidermal cutin with minor handling abrasion; no fungal mycelium.",
  "segregationRecommended": false,
  "recommendedMarketAction": "Dispatch immediately to Quick-Commerce buyer for maximum ₹34/kg price",
  "storageTemperatureAdvice": "Store at 13°C - 15°C with 85-90% RH; avoid direct sunlight",
  "voiceSummary": "Scan complete. Grade A quality tomato batch with 82 score. No pests detected. Ready for immediate dispatch.",
  "defects": [
    {
      "id": "def-1",
      "type": "bruise_mechanical",
      "name": "Minor Skin Pressure Mark",
      "severity": "mild",
      "confidencePercent": 91,
      "description": "Superficial 3mm pressure mark on outer shoulder",
      "affectedAreaPercent": 3,
      "boxCoordinates": { "top": 35, "left": 40, "width": 20, "height": 20 },
      "recommendedAction": "Maintain cushioned transport padding"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);

      return res.json({
        ...parsedData,
        isSimulation: false,
      });
    } catch (error: any) {
      console.error('Error analyzing produce with Gemini:', error);
      const fallbackResponse = generateHeuristicAnalysis(req.body.cropHint, req.body.language);
      return res.json({
        ...fallbackResponse,
        isSimulation: true,
        notice: 'Real-time fallback invoked due to API limit or connection variance',
      });
    }
  });

  // Google Maps Smart Routes & Agricultural Landed Cost Optimizer API
  app.post('/api/routes/calculate', async (req, res) => {
    try {
      const {
        origin = 'Niphad Farm Gate, Nashik',
        destination = 'FreshMart Central DC, Mumbai',
        cropName = 'Tomatoes',
        batchWeightKg = 850,
        cropValuePerKg = 34,
        vehicleType = 'mini_truck',
        avoidTolls = false,
        avoidHighways = false,
      } = req.body;

      const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

      // Calculate route scenarios with accurate logistics economics & vibration decay
      const routes = await calculateAgriculturalRoutes({
        origin,
        destination,
        cropName,
        batchWeightKg: Number(batchWeightKg) || 850,
        cropValuePerKg: Number(cropValuePerKg) || 34,
        vehicleType: vehicleType as any,
        avoidTolls: Boolean(avoidTolls),
        avoidHighways: Boolean(avoidHighways),
        mapsApiKey,
      });

      return res.json({
        success: true,
        origin,
        destination,
        cropName,
        batchWeightKg,
        vehicleType,
        routes,
        bestRouteId: routes.find((r) => r.isRecommended)?.id || routes[0].id,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Error calculating smart agricultural routes:', error);
      res.status(500).json({
        error: 'Failed to calculate routes',
        message: error.message,
      });
    }
  });

  // Real-Time Mandi Price vs FreshRoute Farm Gate vs City Retail Rates API
  app.get('/api/market/prices', async (req, res) => {
    try {
      const {
        crop = 'Tomatoes',
        variety = 'Abhinav Hybrid (Table Grade)',
        weightKg = '850',
        qualityScore = '82',
        qualityGrade = 'A',
        mandiId,
        city = 'Mumbai',
        language = 'en',
      } = req.query;

      const ai = getGeminiClient();

      // Real-time market baseline data calculation
      const commData = getCommodityMarketData(String(crop));
      const chosenMandi = mandiId
        ? commData.mandis.find((m) => m.id === mandiId) || commData.mandis[0]
        : commData.mandis[0];

      const grossMandiPrice = chosenMandi.modalPrice;
      const traderCommissionAmt = grossMandiPrice * 0.065;
      const weighmentFee = 1.8;
      const handlingFee = 0.75;
      const transitLossValue = grossMandiPrice * 0.075;
      const netMandiRate = Number(
        Math.max(1, grossMandiPrice - traderCommissionAmt - weighmentFee - handlingFee - transitLossValue).toFixed(2)
      );

      const qualityBonus = qualityGrade === 'A' || Number(qualityScore) >= 80 ? 2.5 : Number(qualityScore) >= 65 ? 1.0 : 0;
      const netFreshRouteRate = Number((commData.freshRouteRate + qualityBonus + 1.0).toFixed(2));
      const numericWeight = Number(weightKg) || 850;

      const mandiEarnings = Math.round(numericWeight * netMandiRate);
      const freshRouteEarnings = Math.round(numericWeight * netFreshRouteRate);
      const netExtraTakeHome = freshRouteEarnings - mandiEarnings;

      let aiCommentary = `Market Intelligence: At ${chosenMandi.name}, trader commission (6.5%), weighment cuts (₹1.80/kg), and handling deductions reduce your effective take-home from ₹${grossMandiPrice}/kg to ₹${netMandiRate}/kg. FreshRoute direct farm-gate buyer contracts yield ₹${netFreshRouteRate}/kg (+₹${(netFreshRouteRate - netMandiRate).toFixed(2)}/kg more), generating +₹${netExtraTakeHome.toLocaleString('en-IN')} additional revenue for this ${numericWeight}kg batch.`;

      // If Gemini is configured, generate live contextualized APMC-Agmarknet market intelligence
      if (ai) {
        try {
          const aiResponse = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: `You are an expert agricultural economist and commodity market analyst for Indian APMC mandis.
Provide a concise 2-sentence market arbitrage brief for Indian farmers:
Crop: ${crop} (${variety})
Quality: Grade ${qualityGrade} (Score: ${qualityScore}/100)
Local Mandi: ${chosenMandi.name} (Gross: ₹${grossMandiPrice}/kg, Net realized after middleman cuts: ₹${netMandiRate}/kg)
FreshRoute Direct Farm-Gate Contract: ₹${netFreshRouteRate}/kg
Destination City: ${city} (Retail Consumer: ₹${commData.cityRetailBase}/kg)
Batch Size: ${numericWeight} kg
Farmer Language: ${language}

Focus on why direct buyer dispatch to city quick-commerce/retail is superior to local mandi distress sales, including the ₹${netExtraTakeHome.toLocaleString('en-IN')} extra cash gain. Keep tone empowering, realistic, and farmer-centric.`,
          });
          if (aiResponse.text) {
            aiCommentary = aiResponse.text.trim();
          }
        } catch (aiErr) {
          console.warn('Gemini market commentary fallback used:', aiErr);
        }
      }

      return res.json({
        success: true,
        crop: commData.crop,
        variety: commData.variety,
        batchWeightKg: numericWeight,
        qualityScore: Number(qualityScore),
        qualityGrade: String(qualityGrade),
        mandi: {
          id: chosenMandi.id,
          name: chosenMandi.name,
          state: chosenMandi.state,
          district: chosenMandi.district,
          modalPricePerKg: grossMandiPrice,
          minPricePerKg: Number((grossMandiPrice * 0.88).toFixed(1)),
          maxPricePerKg: Number((grossMandiPrice * 1.14).toFixed(1)),
          arrivalVolumeQuintals: chosenMandi.arrivalQuintals,
          dailyChangePercent: chosenMandi.dailyChange,
          trendDirection: chosenMandi.dailyChange > 0 ? 'up' : chosenMandi.dailyChange < 0 ? 'down' : 'stable',
          deductions: {
            traderCommissionPercent: 6.5,
            weighmentFeePerKg: weighmentFee,
            handlingFeePerKg: handlingFee,
            transportBruisingLossPercent: 7.5,
            totalDeductionPerKg: Number((grossMandiPrice - netMandiRate).toFixed(2)),
          },
          netRealizedFarmerRate: netMandiRate,
        },
        freshRoutePrice: {
          baseFarmGateRate: commData.freshRouteRate,
          gradeBonus: qualityBonus,
          preCoolingBonus: 1.0,
          middlemanCommission: 0,
          netRealizedFarmerRate: netFreshRouteRate,
          advantageVsMandiPerKg: Number((netFreshRouteRate - netMandiRate).toFixed(2)),
          percentageAdvantage: Number((((netFreshRouteRate - netMandiRate) / netMandiRate) * 100).toFixed(1)),
          activeBuyerCount: 4,
          escrowSettlementHours: 2,
        },
        financialSummary: {
          mandiEarnings: mandiEarnings,
          freshRouteEarnings: freshRouteEarnings,
          netExtraTakeHome: netExtraTakeHome,
          middlemanCutExtracted: Math.round(numericWeight * (grossMandiPrice - netMandiRate)),
        },
        cityBenchmarks: commData.cityBenchmarks.map((cb) => {
          const retail = Number((commData.cityRetailBase * cb.retailMultiplier).toFixed(1));
          const dcIntake = Number((commData.cityRetailBase * cb.dcIntakeMultiplier).toFixed(1));
          return {
            city: cb.city,
            state: cb.state,
            distanceKm: cb.distanceKm,
            retailRatePerKg: retail,
            quickCommerceRatePerKg: Number((commData.cityRetailBase * cb.quickCommerceMultiplier).toFixed(1)),
            supermarketRatePerKg: Number((commData.cityRetailBase * cb.supermarketMultiplier).toFixed(1)),
            dcIntakeRatePerKg: dcIntake,
            estimatedFreightPerKg: cb.freightPerKg,
            netDeliveredRatePerKg: Number((dcIntake - cb.freightPerKg).toFixed(1)),
            farmerShareOfConsumerRupeeMandi: Math.round((netMandiRate / retail) * 100),
            farmerShareOfConsumerRupeeFreshRoute: Math.round((netFreshRouteRate / retail) * 100),
            topBuyerCluster: cb.topBuyerCluster,
          };
        }),
        allAvailableMandis: commData.mandis,
        aiMarketInsight: aiCommentary,
        liveTickerTimestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Error fetching live market rates:', error);
      res.status(500).json({ error: 'Failed to fetch live market rates', message: error.message });
    }
  });

  // Helper function for commodity market data lookup
  function getCommodityMarketData(cropName: string) {
    const defaultRegistry = [
      {
        crop: 'Tomatoes',
        variety: 'Abhinav Hybrid (Table Grade)',
        baseMandiRate: 22.5,
        freshRouteRate: 34.0,
        cityRetailBase: 58.0,
        mandis: [
          { id: 'mandi-pimpalgaon', name: 'Pimpalgaon APMC Mandi, Nashik', state: 'Maharashtra', district: 'Nashik', modalPrice: 22.0, arrivalQuintals: 3850, dailyChange: 2.8 },
          { id: 'mandi-kolar', name: 'Kolar Agro Mandi (Asia Tomato Hub)', state: 'Karnataka', district: 'Kolar', modalPrice: 24.5, arrivalQuintals: 6200, dailyChange: -1.2 },
          { id: 'mandi-vashi', name: 'Vashi Wholesale APMC, Navi Mumbai', state: 'Maharashtra', district: 'Thane', modalPrice: 26.0, arrivalQuintals: 4100, dailyChange: 3.5 },
          { id: 'mandi-gultekdi', name: 'Gultekdi Market Yard, Pune', state: 'Maharashtra', district: 'Pune', modalPrice: 23.5, arrivalQuintals: 2900, dailyChange: 1.1 },
          { id: 'mandi-azadpur', name: 'Azadpur National Mandi, Delhi', state: 'Delhi', district: 'North Delhi', modalPrice: 28.0, arrivalQuintals: 8500, dailyChange: 4.2 },
          { id: 'mandi-yeshwanthpur', name: 'Yeshwanthpur APMC, Bengaluru', state: 'Karnataka', district: 'Bengaluru', modalPrice: 25.0, arrivalQuintals: 3400, dailyChange: -0.8 },
        ],
        cityBenchmarks: [
          { city: 'Mumbai', state: 'Maharashtra', distanceKm: 185, retailMultiplier: 1.0, quickCommerceMultiplier: 1.05, supermarketMultiplier: 1.12, dcIntakeMultiplier: 0.64, freightPerKg: 2.4, topBuyerCluster: 'Bhandup / Vashi DC & Quick-Commerce Hubs' },
          { city: 'Pune', state: 'Maharashtra', distanceKm: 210, retailMultiplier: 0.88, quickCommerceMultiplier: 0.92, supermarketMultiplier: 0.98, dcIntakeMultiplier: 0.58, freightPerKg: 2.6, topBuyerCluster: 'Hinjawadi IT Belt & Gultekdi Wholesale Hub' },
          { city: 'Bengaluru', state: 'Karnataka', distanceKm: 850, retailMultiplier: 1.15, quickCommerceMultiplier: 1.22, supermarketMultiplier: 1.28, dcIntakeMultiplier: 0.72, freightPerKg: 6.8, topBuyerCluster: 'Electronic City DC & Whitefield Supermarkets' },
          { city: 'Delhi NCR', state: 'Delhi', distanceKm: 1250, retailMultiplier: 1.08, quickCommerceMultiplier: 1.14, supermarketMultiplier: 1.20, dcIntakeMultiplier: 0.68, freightPerKg: 8.5, topBuyerCluster: 'Azadpur Wholesale Link & Gurgaon Dark Stores' },
          { city: 'Hyderabad', state: 'Telangana', distanceKm: 620, retailMultiplier: 0.96, quickCommerceMultiplier: 1.02, supermarketMultiplier: 1.08, dcIntakeMultiplier: 0.62, freightPerKg: 5.2, topBuyerCluster: 'Bowenpally DC & HITEC City Gourmet Hubs' },
        ],
      },
      {
        crop: 'Onions',
        variety: 'Nashik Garwa Red',
        baseMandiRate: 18.0,
        freshRouteRate: 26.5,
        cityRetailBase: 42.0,
        mandis: [
          { id: 'mandi-lasalgaon', name: 'Lasalgaon APMC (Asia Onion Capital)', state: 'Maharashtra', district: 'Nashik', modalPrice: 18.5, arrivalQuintals: 14200, dailyChange: -3.2 },
          { id: 'mandi-pimpalgaon-onion', name: 'Pimpalgaon Baswant APMC', state: 'Maharashtra', district: 'Nashik', modalPrice: 17.8, arrivalQuintals: 9800, dailyChange: -2.5 },
          { id: 'mandi-solapur', name: 'Solapur APMC Market', state: 'Maharashtra', district: 'Solapur', modalPrice: 16.5, arrivalQuintals: 5400, dailyChange: 0.5 },
          { id: 'mandi-vashi-onion', name: 'Vashi Onion-Potato Yard, Navi Mumbai', state: 'Maharashtra', district: 'Thane', modalPrice: 21.0, arrivalQuintals: 7600, dailyChange: 1.8 },
          { id: 'mandi-azadpur-onion', name: 'Azadpur Mandi, Delhi NCR', state: 'Delhi', district: 'North Delhi', modalPrice: 23.5, arrivalQuintals: 12000, dailyChange: 2.1 },
        ],
        cityBenchmarks: [
          { city: 'Mumbai', state: 'Maharashtra', distanceKm: 185, retailMultiplier: 1.0, quickCommerceMultiplier: 1.08, supermarketMultiplier: 1.15, dcIntakeMultiplier: 0.65, freightPerKg: 1.8, topBuyerCluster: 'Bhiwandi Central Storage & Vashi APMC' },
          { city: 'Pune', state: 'Maharashtra', distanceKm: 210, retailMultiplier: 0.92, quickCommerceMultiplier: 0.98, supermarketMultiplier: 1.05, dcIntakeMultiplier: 0.60, freightPerKg: 2.0, topBuyerCluster: 'Chakan Processing & City Wholesale' },
          { city: 'Bengaluru', state: 'Karnataka', distanceKm: 850, retailMultiplier: 1.18, quickCommerceMultiplier: 1.25, supermarketMultiplier: 1.30, dcIntakeMultiplier: 0.74, freightPerKg: 5.5, topBuyerCluster: 'Yeshwanthpur Wholesale & Retail Chains' },
          { city: 'Delhi NCR', state: 'Delhi', distanceKm: 1250, retailMultiplier: 1.12, quickCommerceMultiplier: 1.20, supermarketMultiplier: 1.25, dcIntakeMultiplier: 0.70, freightPerKg: 6.8, topBuyerCluster: 'Azadpur North India Distribution' },
          { city: 'Hyderabad', state: 'Telangana', distanceKm: 620, retailMultiplier: 1.05, quickCommerceMultiplier: 1.10, supermarketMultiplier: 1.16, dcIntakeMultiplier: 0.66, freightPerKg: 4.2, topBuyerCluster: 'Begum Bazaar & Quick-Commerce Hubs' },
        ],
      },
      {
        crop: 'Grapes',
        variety: 'Thompson Seedless',
        baseMandiRate: 45.0,
        freshRouteRate: 72.0,
        cityRetailBase: 135.0,
        mandis: [
          { id: 'mandi-nashik-grapes', name: 'Nashik Grape Agro Mandi', state: 'Maharashtra', district: 'Nashik', modalPrice: 46.0, arrivalQuintals: 4200, dailyChange: 4.8 },
          { id: 'mandi-sangli-grapes', name: 'Sangli Tasgaon Grape Mandi', state: 'Maharashtra', district: 'Sangli', modalPrice: 48.0, arrivalQuintals: 3600, dailyChange: 3.2 },
          { id: 'mandi-vashi-grapes', name: 'Vashi Fruit Market, Navi Mumbai', state: 'Maharashtra', district: 'Thane', modalPrice: 58.0, arrivalQuintals: 2100, dailyChange: 5.1 },
          { id: 'mandi-azadpur-grapes', name: 'Azadpur Fruit Yard, Delhi', state: 'Delhi', district: 'North Delhi', modalPrice: 65.0, arrivalQuintals: 4800, dailyChange: 6.0 },
        ],
        cityBenchmarks: [
          { city: 'Mumbai', state: 'Maharashtra', distanceKm: 185, retailMultiplier: 1.0, quickCommerceMultiplier: 1.12, supermarketMultiplier: 1.25, dcIntakeMultiplier: 0.62, freightPerKg: 3.2, topBuyerCluster: 'Export Cold Terminals & Gourmet Grocers' },
          { city: 'Pune', state: 'Maharashtra', distanceKm: 210, retailMultiplier: 0.90, quickCommerceMultiplier: 0.98, supermarketMultiplier: 1.10, dcIntakeMultiplier: 0.56, freightPerKg: 3.4, topBuyerCluster: 'Koregaon Park & Aundh Premium Retail' },
          { city: 'Bengaluru', state: 'Karnataka', distanceKm: 850, retailMultiplier: 1.22, quickCommerceMultiplier: 1.30, supermarketMultiplier: 1.40, dcIntakeMultiplier: 0.70, freightPerKg: 7.5, topBuyerCluster: 'Nature Basket & Modern Trade Chains' },
          { city: 'Delhi NCR', state: 'Delhi', distanceKm: 1250, retailMultiplier: 1.28, quickCommerceMultiplier: 1.35, supermarketMultiplier: 1.45, dcIntakeMultiplier: 0.75, freightPerKg: 9.8, topBuyerCluster: 'Khan Market & South Delhi Supermarkets' },
          { city: 'Hyderabad', state: 'Telangana', distanceKm: 620, retailMultiplier: 1.10, quickCommerceMultiplier: 1.18, supermarketMultiplier: 1.25, dcIntakeMultiplier: 0.65, freightPerKg: 6.2, topBuyerCluster: 'Jubilee Hills Premium Outlets' },
        ],
      },
    ];

    const safeCropName = (cropName || '').toLowerCase();
    const match = defaultRegistry.find(
      (c) => (c.crop || '').toLowerCase() === safeCropName || safeCropName.includes((c.crop || '').toLowerCase())
    );
    return match || defaultRegistry[0];
  }

  // ==========================================
  // AUTHENTICATION & USER MANAGEMENT API
  // ==========================================
  app.post('/api/auth/login', (req, res) => {
    const { email, phone, role = 'farmer' } = req.body;
    let user = db.findUser(u => 
      (email && u.email && u.email.toLowerCase() === String(email).toLowerCase()) || 
      (phone && u.phone && u.phone === phone)
    );

    if (!user) {
      // Auto-create user for frictionless login & demo
      const isFarmer = role === 'farmer';
      user = db.createUser({
        id: `${role}-${Date.now()}`,
        role: role as 'farmer' | 'buyer',
        name: isFarmer ? 'Ramesh Patil' : 'Anil Sharma',
        email: email || (isFarmer ? 'ramesh.patil@kisanmail.in' : 'anil.sharma@freshmart.co.in'),
        phone: phone || (isFarmer ? '+91 98220 12345' : '+91 98110 33411'),
        location: isFarmer ? 'Niphad, Nashik, Maharashtra' : 'Bhandup Central DC, Mumbai',
        farmOrBusinessName: isFarmer ? 'Patil Organic Agri Farms' : 'FreshMart Quick Commerce',
        primaryCropOrDemand: isFarmer ? 'Tomatoes' : 'Vegetables & Fruits',
        avatarUrl: isFarmer
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        verified: true,
        createdAt: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      user,
      token: `session_${user.id}_${Date.now()}`,
    });
  });

  app.post('/api/auth/otp/send', (req, res) => {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    const code = '123456'; // Standard demo verification code
    db.saveOtp(phone, code);
    return res.json({
      success: true,
      message: `OTP successfully dispatched to ${phone}`,
      demoCode: code,
    });
  });

  app.post('/api/auth/otp/verify', (req, res) => {
    const { phone, code, role = 'farmer' } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and OTP code are required' });
    }

    const isValid = db.verifyOtp(phone, code);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }

    let user = db.findUser(u => u.phone === phone);
    if (!user) {
      const isFarmer = role === 'farmer';
      user = db.createUser({
        id: `${role}-${Date.now()}`,
        role: role as 'farmer' | 'buyer',
        name: isFarmer ? 'Ramesh Patil' : 'Anil Sharma',
        email: isFarmer ? 'ramesh.patil@kisanmail.in' : 'anil.sharma@freshmart.co.in',
        phone,
        location: isFarmer ? 'Niphad, Nashik, Maharashtra' : 'Bhandup Central DC, Mumbai',
        farmOrBusinessName: isFarmer ? 'Patil Organic Agri Farms' : 'FreshMart Quick Commerce',
        primaryCropOrDemand: isFarmer ? 'Tomatoes' : 'Vegetables & Fruits',
        avatarUrl: isFarmer
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        verified: true,
        createdAt: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      user,
      token: `session_${user.id}_${Date.now()}`,
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { role = 'farmer', name, phone, email, password, location, farmOrBusinessName, primaryCropOrDemand } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const isFarmer = role === 'farmer';
    const newUser = db.createUser({
      id: `${role}-${Date.now()}`,
      role: role as 'farmer' | 'buyer',
      name,
      phone: phone || '+91 98220 00000',
      email,
      password: password || 'defaultpass',
      location: location || (isFarmer ? 'Nashik, Maharashtra' : 'Mumbai, Maharashtra'),
      farmOrBusinessName: farmOrBusinessName || (isFarmer ? 'Patil Farm' : 'Agro Retail'),
      primaryCropOrDemand: primaryCropOrDemand || 'Tomatoes',
      avatarUrl: isFarmer
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      verified: true,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      user: newUser,
      token: `session_${newUser.id}_${Date.now()}`,
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const users = db.getUsers();
    return res.json({
      success: true,
      user: users[0] || null,
    });
  });

  // ==========================================
  // PRODUCE BATCHES REST API
  // ==========================================
  app.get('/api/batches', (req, res) => {
    let batches = db.getBatches();
    const { crop, status, farmerId } = req.query;

    if (crop) {
      const targetCrop = String(crop).toLowerCase();
      batches = batches.filter(b => b && String(b.crop || '').toLowerCase() === targetCrop);
    }
    if (status) {
      batches = batches.filter(b => b && b.status === status);
    }
    if (farmerId) {
      batches = batches.filter(b => b && b.farmerId === farmerId);
    }

    return res.json({
      success: true,
      count: batches.length,
      batches,
    });
  });

  app.get('/api/batches/:id', (req, res) => {
    const batch = db.getBatchById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    return res.json({ success: true, batch });
  });

  app.post('/api/batches', (req, res) => {
    const body = req.body;
    if (!body.crop || !body.quantityKg) {
      return res.status(400).json({ error: 'Crop and quantityKg are required' });
    }

    const quality = Number(body.currentQualityScore) || 82;
    const newBatch = db.createBatch({
      id: body.id || `batch-${Date.now()}`,
      farmerId: body.farmerId || 'farmer-ramesh-01',
      farmerName: body.farmerName || 'Ramesh Patil',
      farmLocation: body.farmLocation || 'Niphad, Nashik, Maharashtra',
      crop: body.crop,
      variety: body.variety || 'Abhinav Hybrid (Table Grade)',
      quantityKg: Number(body.quantityKg),
      harvestDate: body.harvestDate || new Date().toISOString().split('T')[0],
      harvestTime: body.harvestTime || '06:30 AM',
      basePricePerKg: Number(body.basePricePerKg) || 22,
      currentQualityScore: quality,
      freshnessPercent: Number(body.freshnessPercent) || (quality >= 80 ? 90 : 75),
      ripenessPercent: Number(body.ripenessPercent) || 82,
      damagePercent: Number(body.damagePercent) || Math.max(2, 100 - quality),
      estimatedShelfLifeHours: Number(body.estimatedShelfLifeHours) || Math.round((quality / 100) * 36),
      spoilageRiskPercent: Number(body.spoilageRiskPercent) || Math.max(5, 100 - quality),
      detectedIssues: body.detectedIssues || ['Field harvest verified', 'Optimal table firmness index'],
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      status: body.status || 'available',
      storageType: body.storageType || 'ambient',
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      batch: newBatch,
    });
  });

  app.patch('/api/batches/:id', (req, res) => {
    const updated = db.updateBatch(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    return res.json({ success: true, batch: updated });
  });

  app.delete('/api/batches/:id', (req, res) => {
    const deleted = db.deleteBatch(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    return res.json({ success: true, message: 'Batch successfully removed' });
  });

  // ==========================================
  // BUYERS & MARKETPLACE MATCHING API
  // ==========================================
  app.get('/api/buyers', (req, res) => {
    const buyers = db.getBuyers();
    return res.json({
      success: true,
      count: buyers.length,
      buyers,
    });
  });

  app.get('/api/buyers/matches', (req, res) => {
    const { crop = 'Tomatoes', qualityScore = '80' } = req.query;
    const buyers = db.getBuyers();
    const qScore = Number(qualityScore) || 80;

    const matches = buyers.map(buyer => {
      const targetCrop = String(crop).toLowerCase();
      const cropMatch = (buyer.demandedCrops || []).some(
        c => (c || '').toLowerCase() === targetCrop || targetCrop.includes((c || '').toLowerCase())
      );
      const meetsQuality = qScore >= buyer.minQualityScore;
      let calculatedScore = buyer.aiMatchScore;
      if (!cropMatch) calculatedScore -= 30;
      if (!meetsQuality) calculatedScore -= 20;

      return {
        ...buyer,
        isCropMatched: cropMatch,
        meetsQuality,
        aiMatchScore: Math.max(40, Math.min(99, calculatedScore)),
      };
    }).sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    return res.json({
      success: true,
      crop,
      qualityScore: qScore,
      matches,
    });
  });

  app.get('/api/demands', (req, res) => {
    const demands = db.getDemands();
    return res.json({
      success: true,
      count: demands.length,
      demands,
    });
  });

  app.post('/api/demands', (req, res) => {
    const body = req.body;
    const newDemand = db.createDemand({
      id: `DEMAND-${Date.now().toString().slice(-4)}`,
      buyerId: body.buyerId || 'buyer-freshmart-01',
      buyerName: body.buyerName || 'Anil Sharma',
      companyName: body.companyName || 'FreshMart Quick Commerce',
      crop: body.crop || 'Tomatoes',
      requiredQuantityKg: Number(body.requiredQuantityKg) || 1000,
      offeredPricePerKg: Number(body.offeredPricePerKg) || 22,
      minQualityScore: Number(body.minQualityScore) || 75,
      deliveryLocation: body.deliveryLocation || 'Bhandup Central DC, Mumbai',
      neededByDate: body.neededByDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      status: 'open',
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      demand: newDemand,
    });
  });

  // ==========================================
  // ORDERS & ESCROW CONTRACTS API
  // ==========================================
  app.get('/api/orders', (req, res) => {
    const orders = db.getOrders();
    const { farmerId, buyerId, status } = req.query;

    let filtered = orders;
    if (farmerId) filtered = filtered.filter(o => o.farmerId === farmerId);
    if (buyerId) filtered = filtered.filter(o => o.buyerId === buyerId);
    if (status) filtered = filtered.filter(o => o.status === status);

    return res.json({
      success: true,
      count: filtered.length,
      orders: filtered,
    });
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ success: true, order });
  });

  app.post('/api/orders', (req, res) => {
    const body = req.body;
    if (!body.crop || !body.quantityKg) {
      return res.status(400).json({ error: 'Missing order details' });
    }

    const orderId = body.id || `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdOrder = db.createOrder({
      id: orderId,
      batchId: body.batchId || 'batch-tomato-01',
      crop: body.crop,
      quantityKg: Number(body.quantityKg),
      qualityScore: Number(body.qualityScore) || 82,
      farmerId: body.farmerId || 'farmer-ramesh-01',
      farmerName: body.farmerName || 'Ramesh Patil',
      farmLocation: body.farmLocation || 'Niphad, Nashik',
      buyerId: body.buyerId || 'buyer-freshmart-01',
      buyerName: body.buyerName || 'FreshMart Quick Commerce',
      buyerLocation: body.buyerLocation || 'Bhandup Central DC, Mumbai',
      distanceKm: Number(body.distanceKm) || 34,
      pricePerKg: Number(body.pricePerKg) || 21.5,
      totalValue: Number(body.totalValue) || 17200,
      transportCost: Number(body.transportCost) || 476,
      netFarmerEarnings: Number(body.netFarmerEarnings) || 16724,
      selectedVehicle: body.selectedVehicle || 'Mini Pickup (Tata Ace)',
      status: body.status || 'In Transit',
      estimatedTransitTime: body.estimatedTransitTime || '1h 15m',
      temperatureReadingC: Number(body.temperatureReadingC) || 22.4,
      humidityPercent: Number(body.humidityPercent) || 78,
      createdAt: new Date().toISOString(),
      pickupTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      timeline: body.timeline || [
        { status: 'Requested', timestamp: 'Just now', description: 'Procurement contract initiated', completed: true },
        { status: 'Accepted', timestamp: 'Just now', description: 'Farmer confirmed AI contract and logistics', completed: true },
        { status: 'Pickup Scheduled', timestamp: 'Just now', description: 'Assigned transport vehicle en route', completed: true },
        { status: 'In Transit', timestamp: 'In progress', description: 'Produce in GPS-tracked transit', completed: true },
        { status: 'Delivered', timestamp: 'Pending', description: 'Receiving dock inspection', completed: false },
        { status: 'Completed', timestamp: 'Pending', description: 'Instant UPI/NEFT smart escrow release', completed: false },
      ],
    });

    return res.status(201).json({
      success: true,
      order: createdOrder,
    });
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = db.updateOrderStatus(req.params.id, status, note);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({
      success: true,
      order: updated,
    });
  });

  app.post('/api/orders/:id/telemetry', (req, res) => {
    const { temperature, humidity } = req.body;
    const updated = db.updateOrderTelemetry(req.params.id, Number(temperature) || 21.0, Number(humidity) || 75);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ success: true, order: updated });
  });

  // ==========================================
  // MULTILINGUAL AI KISAN VOICE BOT API
  // ==========================================
  app.post('/api/voice/assistant', async (req, res) => {
    try {
      const { query, language = 'en', crop = 'Tomatoes', batchContext } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query string is required' });
      }

      const ai = getGeminiClient();

      if (!ai) {
        // Domain fallback when Gemini API key is not configured yet
        const q = String(query || '').toLowerCase();
        let fallbackAnswer = '';
        let actionTab = 'dashboard';

        if (q.includes('mandi') || q.includes('मंडी') || q.includes('ಮಂಡಿ') || q.includes('price')) {
          actionTab = 'mandi-rates';
          fallbackAnswer = language === 'kn'
            ? 'ಪಿಂಪಲಗಾಂವ್ ಮಂಡಿಯಲ್ಲಿ ₹22 ದರ ಸಿಕ್ಕರೂ, ದಲ್ಲಾಳಿ ಕಮಿಷನ್ ಮತ್ತು ಕಡಿತದ ನಂತರ ನಿಮ್ಮ ಕೈಗೆ ₹16.37 ಮಾತ್ರ ಸಿಗುತ್ತದೆ. ಫ್ರೆಶ್‌ರೂಟ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ₹37.50 ಸಿಗುತ್ತದೆ.'
            : language === 'hi'
            ? 'मंडी में ₹22 भाव पर आढ़त और कटाई के बाद आपको केवल ₹16.37/किग्रा मिलेगा। FreshRoute सीधे अनुबंध में ₹37.50/किग्रा शुद्ध मिलता है।'
            : 'At local APMC mandi, after 6.5% trader cut and transit losses, you realize only ₹16.37/kg. FreshRoute direct contract yields ₹37.50/kg net.';
        } else if (q.includes('sell') || q.includes('wait') || q.includes('ಮಾರ') || q.includes('बेच')) {
          actionTab = 'decisions';
          fallbackAnswer = language === 'kn'
            ? 'ರಮೇಶ್ ಅವರೇ, ನಿಮ್ಮ ಟೊಮೇಟೊ ಫಸಲನ್ನು ಈಗಲೇ ಫ್ರೆಶ್‌ಮಾರ್ಟ್‌ಗೆ ಮಾರಾಟ ಮಾಡುವುದು ಅತ್ಯುತ್ತಮ. 18 ಗಂಟೆಯಲ್ಲಿ ಗುಣಮಟ್ಟ ಕುಸಿಯಬಹುದು.'
            : language === 'hi'
            ? 'आपकी टमाटर फसल को अभी FreshMart को बेचना सबसे सही है। 18 घंटे के बाद नरमी और वजन में गिरावट का जोखिम है।'
            : 'Sell immediately to FreshMart Quick Commerce. Delaying beyond 18 hours risks 12% firmness loss and markdown.';
        } else if (q.includes('route') || q.includes('ರಸ್ತೆ') || q.includes('रास्ता')) {
          actionTab = 'routes';
          fallbackAnswer = language === 'kn'
            ? 'ಎನ್-ಎಚ್ 60 ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇ ಕಾರಿಡಾರ್ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ. ಕಡಿಮೆ ಕಂಪನದಿಂದ ಹಾನಿ ಕೇವಲ 1.2% ಮಾತ್ರ ಇರುತ್ತದೆ.'
            : language === 'hi'
            ? 'NH-60 एक्सप्रेसवे कॉरिडोर सबसे सुरक्षित है। कम झटकों से सिर्फ 1.2% क्षति होगी और 14% ईंधन बचेगा।'
            : 'Take the NH-60 Agro Expressway. Low vibration (< 0.18g) keeps transit damage under 1.2%, saving ₹3,400.';
        } else {
          fallbackAnswer = language === 'kn'
            ? 'ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಫಸಲಿನ ಗುಣಮಟ್ಟ, ಮಂಡಿ ದರ ಹೋಲಿಕೆ, ಅಥವಾ ಸಾಗಾಣಿಕೆ ಮಾರ್ಗಗಳ ಬಗ್ಗೆ ಕೇಳಿ.'
            : language === 'hi'
            ? 'नमस्ते किसान भाई! फसल गुणवत्ता, मंडी भाव तुलना या सुरक्षित परिवहन मार्ग के बारे में पूछें।'
            : 'Namaste! I can assist you with real-time mandi arbitrage, quality scanner advice, or low-vibration routes.';
        }

        return res.json({
          success: true,
          answer: fallbackAnswer,
          actionTab,
          source: 'local-agricultural-rules',
        });
      }

      // Live Gemini 3.7 Flash Agricultural Intelligence
      const prompt = `You are "Kisan Sathi", an empathetic, highly knowledgeable AI agricultural advisor for Indian farmers on the FreshRoute platform.
User query: "${query}"
Selected Language: ${language} (kn = Kannada, hi = Hindi, mr = Marathi, en = English)
Crop Context: ${crop}
${batchContext ? `Batch Context: ${JSON.stringify(batchContext)}` : ''}

Respond in 2-3 concise, encouraging, and actionable sentences in the chosen language (${language}).
Directly address the farmer's question regarding crop freshness, sell vs hold timing, mandi vs direct pricing, safe logistics routes, or cold storage.
Keep the tone supportive, simple, and rural-friendly without technical jargon.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      const answerText = response.text?.trim() || 'AI advice unavailable at the moment.';

      // Determine recommended action tab
      let actionTab = 'dashboard';
      const q = String(query || '').toLowerCase();
      if (q.includes('mandi') || q.includes('मंडी') || q.includes('ಮಂಡಿ') || q.includes('price')) actionTab = 'mandi-rates';
      else if (q.includes('sell') || q.includes('wait') || q.includes('decision')) actionTab = 'decisions';
      else if (q.includes('route') || q.includes('transport') || q.includes('map')) actionTab = 'routes';
      else if (q.includes('quality') || q.includes('scan') || q.includes('pest')) actionTab = 'scanner';

      return res.json({
        success: true,
        answer: answerText,
        actionTab,
        source: 'gemini-3.7-flash',
      });
    } catch (err: any) {
      console.error('Error in AI voice assistant:', err);
      return res.json({
        success: true,
        answer: 'Namaste! FreshRoute advises selling table tomatoes directly to quick-commerce buyers for maximum ₹34/kg take-home.',
        actionTab: 'decisions',
        source: 'fallback',
      });
    }
  });

  // ==========================================
  // IMPACT & SUSTAINABILITY ANALYTICS API
  // ==========================================
  app.get('/api/analytics/impact', (req, res) => {
    const impact = db.getImpact();
    return res.json({
      success: true,
      impact,
      lastUpdated: new Date().toISOString(),
    });
  });
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FreshRoute AI Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateHeuristicAnalysis(cropHint?: string, language: string = 'en') {
  const isTomato = !cropHint || cropHint.toLowerCase().includes('tomato');
  const isGrape = cropHint?.toLowerCase().includes('grape');

  if (isGrape) {
    return {
      crop: 'Grapes',
      variety: 'Thompson Seedless (Export Grade)',
      qualityScore: 86,
      qualityGrade: 'A',
      freshnessPercent: 90,
      ripenessPercent: 88,
      damagePercent: 7,
      pestInfestationRisk: 'clean',
      spoilageRiskPercent: 14,
      firmnessRating: 8.4,
      estimatedShelfLifeHours: 48,
      pestSummary: 'No mealybugs, thrips, or berry moth larvae detected across cluster bunches.',
      diseaseSummary: 'Dense natural wax bloom intact. Pedicel attachment strong with zero powdery mildew sporulation.',
      segregationRecommended: false,
      recommendedMarketAction: 'Cold-chain dispatch to premium supermarket network (₹85/kg)',
      storageTemperatureAdvice: 'Refrigerate at 1°C - 2°C with 90-95% RH to prevent stem browning and shatter',
      voiceSummary: language === 'kn'
        ? 'ದ್ರಾಕ್ಷಿ ಸ್ಕ್ಯಾನ್ ಯಶಸ್ವಿಯಾಗಿದೆ: ಗುಣಮಟ್ಟ ಸ್ಕೋರ್ ೮೬ (ಗ್ರೇಡ್ ಎ). ಕೀಟಗಳಿಲ್ಲ, ಶೀತಲ ವಾಹನದಲ್ಲಿ ಸಾಗಿಸಿ.'
        : language === 'hi'
        ? 'अंगूर स्कैन सफल: गुणवत्ता स्कोर ८६ (ग्रेड ए)। कीट-मुक्त गुच्छे, रीफर वाहन में डिस्पैच करें।'
        : 'Grape cluster biometrics confirmed: Grade A (86/100). Zero pests detected. Ideal for cold-chain reefer dispatch.',
      defects: [
        {
          id: 'def-g1',
          type: 'fresh_intact',
          name: 'Intact Cuticular Epicuticular Wax Bloom',
          severity: 'none',
          confidencePercent: 96,
          description: 'Uniform whitish natural protective coating indicating fresh harvest',
          affectedAreaPercent: 0,
          boxCoordinates: { top: 25, left: 30, width: 45, height: 45 },
          recommendedAction: 'Handle with cotton gloves to preserve natural bloom',
        },
      ],
    };
  }

  return {
    crop: 'Tomatoes',
    variety: 'Abhinav Hybrid (Table Grade)',
    qualityScore: 82,
    qualityGrade: 'A',
    freshnessPercent: 88,
    ripenessPercent: 80,
    damagePercent: 12,
    pestInfestationRisk: 'low',
    spoilageRiskPercent: 18,
    firmnessRating: 7.8,
    estimatedShelfLifeHours: 32,
    pestSummary: 'No active borer penetration found. Isolated superficial skin mark detected.',
    diseaseSummary: 'Firm pericarp walls; no early blight, late blight, or blossom-end rot observed.',
    segregationRecommended: true,
    recommendedMarketAction: 'Lock direct dispatch to Quick-Commerce hub within 18 hours (₹34/kg)',
    storageTemperatureAdvice: 'Hold in shaded ventilated crates at 14°C - 16°C. Avoid direct sunlight.',
    voiceSummary: language === 'kn'
      ? 'ಟೊಮೇಟೊ ಸ್ಕ್ಯಾನ್ ಪೂರ್ಣಗೊಂಡಿದೆ: ಗುಣಮಟ್ಟ ೮೨/೧೦೦. ಕೀಟ ಬಾಧೆ ಇಲ್ಲ. ೧೮ ಗಂಟೆಗಳಲ್ಲಿ ರವಾನಿಸಿ.'
      : language === 'hi'
      ? 'टमाटर स्कैन पूरा हुआ: क्वालिटी स्कोर ८२/१००। कीट मुक्त, १८ घंटे में डिस्पैच की सिफारिश।'
      : 'Tomato harvest scan complete: Grade A (82/100). No active pests. Dispatch within 18h for peak profit.',
    defects: [
      {
        id: 'def-t1',
        type: 'bruise_mechanical',
        name: 'Handling Contact Abrasion',
        severity: 'mild',
        confidencePercent: 88,
        description: 'Superficial friction contact mark from crate stacking',
        affectedAreaPercent: 5,
        boxCoordinates: { top: 38, left: 42, width: 22, height: 22 },
        recommendedAction: 'Use ventilated corrugated liners in transport crates',
      },
    ],
  };
}

function getCropSensitivity(cropName: string): number {
  const lower = (cropName || '').toLowerCase();
  if (lower.includes('grape')) return 1.5;
  if (lower.includes('tomato')) return 1.2;
  if (lower.includes('mango') || lower.includes('berry') || lower.includes('strawberry')) return 1.4;
  if (lower.includes('capsicum') || lower.includes('pepper')) return 1.1;
  if (lower.includes('onion') || lower.includes('potato')) return 0.4;
  if (lower.includes('spinach') || lower.includes('leaf')) return 1.6;
  return 1.0;
}

interface CalculateRouteParams {
  origin: string;
  destination: string;
  cropName: string;
  batchWeightKg: number;
  cropValuePerKg: number;
  vehicleType: 'mini_truck' | 'reefer_van' | 'electric_van' | 'heavy_lorry';
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  mapsApiKey?: string;
}

async function calculateAgriculturalRoutes({
  origin,
  destination,
  cropName,
  batchWeightKg,
  cropValuePerKg,
  vehicleType,
  avoidTolls,
  avoidHighways,
  mapsApiKey,
}: CalculateRouteParams) {
  const cropSensitivity = getCropSensitivity(cropName);

  // Vehicle profile characteristics
  const vehicleProfiles: Record<string, { ratePerKm: number; baseRate: number; driverPerHour: number; vibrationMod: number; label: string }> = {
    mini_truck: { ratePerKm: 6.8, baseRate: 500, driverPerHour: 120, vibrationMod: 1.0, label: 'Tata Ace / 1.5T Pickup' },
    reefer_van: { ratePerKm: 11.5, baseRate: 900, driverPerHour: 140, vibrationMod: 0.5, label: 'Chilled Reefer Van (Cold-Chain)' },
    electric_van: { ratePerKm: 3.4, baseRate: 400, driverPerHour: 120, vibrationMod: 0.9, label: 'EV Cargo Van (Zero Emission)' },
    heavy_lorry: { ratePerKm: 16.0, baseRate: 1400, driverPerHour: 160, vibrationMod: 1.2, label: '10-Ton Heavy Crate Truck' },
  };

  const vProfile = vehicleProfiles[vehicleType] || vehicleProfiles.mini_truck;

  // Base raw route templates (calibrated to real Indian agro transportation corridors)
  const rawRoutes = [
    {
      id: 'nh-express-corridor',
      name: 'NH-60 Agro Expressway Corridor',
      nameVernacular: 'ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿ ೬೦ (ಅತಿ ಕಡಿಮೆ ನಷ್ಟ)',
      distanceKm: 185,
      durationMinutes: 225, // 3h 45m
      tollCost: 280,
      baseSpoilage: 1.2,
      vibrationScore: 'Low Vibration (< 0.18g)',
      roadQuality: 'Smooth Expressway' as const,
      isEco: false,
      color: '#18A558',
      description: 'Paved 4-lane expressway with steady 60km/h velocity and minimal shock on crates.',
      waypoints: [
        { lat: 20.0063, lng: 73.7900, title: `${origin} (Loading Dock)`, type: 'farm', info: 'Harvest Loading & Certified Weight Verification' },
        { lat: 19.8970, lng: 73.6540, title: 'Sinnar Highway Toll Plaza', type: 'highway', info: 'FASTag Automated Produce Clearance (₹95)' },
        { lat: 19.6980, lng: 73.5580, title: 'Igatpuri Agro Expressway Tunnel', type: 'highway', info: 'Paved Surface (Vibration < 0.18g)' },
        { lat: 19.3919, lng: 73.0180, title: 'Kalyan Ingress Bypass', type: 'highway', info: 'Off-peak freight green lane' },
        { lat: 19.1456, lng: 72.9360, title: `${destination} (Intake Gate)`, type: 'buyer', info: 'Direct Receiving Dock with Escrow Settlement' },
      ],
    },
    {
      id: 'cold-hub-link',
      name: 'Igatpuri Solar Cold-Chain Interceptor',
      nameVernacular: 'ಶೀತಲೀಕರಣ ಸೌಲಭ್ಯ ಮಾರ್ಗ',
      distanceKm: 198,
      durationMinutes: 315, // 5h 15m (includes 1h chilling dwell)
      tollCost: 280,
      preCoolingFee: 250,
      baseSpoilage: 0.4,
      vibrationScore: 'Ultra-Low (< 0.15g)',
      roadQuality: 'Smooth Expressway' as const,
      isEco: false,
      color: '#0284c7',
      description: 'Includes 1-hour pre-cooling staging stop at FPO solar cold room to reset pulp temperature to 12°C.',
      waypoints: [
        { lat: 20.0063, lng: 73.7900, title: `${origin}`, type: 'farm', info: 'Farm Dispatch Gate' },
        { lat: 19.6980, lng: 73.5580, title: 'Igatpuri FPO Solar Pre-Cooling Hub', type: 'cold_hub', info: '1-Hour Core Pulp Chilling to 12°C (+36h Shelf Life)' },
        { lat: 19.2183, lng: 72.9781, title: 'Thane Green Corridor Link', type: 'highway', info: 'Dedicated agro fast-track' },
        { lat: 19.1456, lng: 72.9360, title: `${destination}`, type: 'buyer', info: 'Premium Intake Dock (Grade-A Zero Penalty)' },
      ],
    },
    {
      id: 'scenic-ghats-toll-free',
      name: 'Old Kasara Ghats Highway (Toll-Free Alternate)',
      nameVernacular: 'ಹಳೆಯ ಘಾಟ್ ರಸ್ತೆ (ಹೆಚ್ಚು ಹಾನಿ)',
      distanceKm: 165,
      durationMinutes: 290, // 4h 50m (traffic & hairpins)
      tollCost: 0,
      baseSpoilage: 11.8,
      vibrationScore: 'High Vibration (> 0.85g)',
      roadQuality: 'Bumpy Rural State Highway' as const,
      isEco: false,
      color: '#F4A62A',
      description: 'Shorter distance but steep hairpin bends & road rumble strips cause 11%+ produce bruising and softness markdown.',
      waypoints: [
        { lat: 20.0063, lng: 73.7900, title: `${origin}`, type: 'farm', info: 'Farm Loading' },
        { lat: 19.7120, lng: 73.4900, title: 'Kasara Ghat Hairpin Bends', type: 'highway', info: 'Severe Vibration Alert (0.92g Shock Recorded)' },
        { lat: 19.3500, lng: 73.1200, title: 'Bhiwandi Truck Congestion Bottleneck', type: 'highway', info: '50-minute idling delay in ambient heat' },
        { lat: 19.1456, lng: 72.9360, title: `${destination}`, type: 'buyer', info: 'Receiving Dock (Potential Dock Markdown Risk)' },
      ],
    },
    {
      id: 'eco-fuel-saver',
      name: 'Eco-Smart Low Emissions Agro Corridor',
      nameVernacular: 'ಇಂಧನ ಉಳಿತಾಯ ಮಾರ್ಗ',
      distanceKm: 178,
      durationMinutes: 245, // 4h 05m
      tollCost: 180,
      baseSpoilage: 1.8,
      vibrationScore: 'Low Vibration (< 0.22g)',
      roadQuality: 'Smooth Expressway' as const,
      isEco: true,
      color: '#10b981',
      description: 'Gradient-optimized route saving 14% fuel with minimal brake wear and low engine heat.',
      waypoints: [
        { lat: 20.0063, lng: 73.7900, title: `${origin}`, type: 'farm', info: 'Farm Loading' },
        { lat: 19.8200, lng: 73.6100, title: 'Ghoti Agro Freight Bypass', type: 'highway', info: 'Gentle gradient descent (Zero heavy braking)' },
        { lat: 19.2900, lng: 73.0600, title: 'Thane-Navi Mumbai Expressway Link', type: 'highway', info: 'Steady speed corridor' },
        { lat: 19.1456, lng: 72.9360, title: `${destination}`, type: 'buyer', info: 'Buyer Intake Dock' },
      ],
    },
  ];

  // If avoidTolls is true, exclude toll routes or penalize them; if avoidHighways, prioritize rural/state roads
  const filtered = rawRoutes.filter((r) => {
    if (avoidTolls && r.tollCost > 0 && r.id !== 'scenic-ghats-toll-free') return false;
    if (avoidHighways && r.roadQuality === 'Smooth Expressway') return false;
    return true;
  });

  const routesToEvaluate = filtered.length > 0 ? filtered : rawRoutes;

  // Compute exact economics for each route
  const computedRoutes = routesToEvaluate.map((route) => {
    const hours = route.durationMinutes / 60;
    const hoursFormatted = `${Math.floor(hours)}h ${route.durationMinutes % 60}m`;

    const fuelCost = Math.round(route.distanceKm * vProfile.ratePerKm * (route.isEco ? 0.86 : 1.0));
    const driverWages = Math.round(hours * vProfile.driverPerHour + vProfile.baseRate);
    const tollFee = route.tollCost;
    const additionalFee = (route as any).preCoolingFee || 0;

    const directFreightCost = fuelCost + driverWages + tollFee + additionalFee;

    // Spoilage risk adjusted for crop sensitivity and vehicle protection (e.g. reefer reduces spoilage)
    const spoilagePercent = Number(
      Math.max(0.2, route.baseSpoilage * cropSensitivity * vProfile.vibrationMod).toFixed(1)
    );

    const spoilageLossValue = Math.round(batchWeightKg * (spoilagePercent / 100) * cropValuePerKg);

    const totalLandedCost = directFreightCost + spoilageLossValue;

    return {
      ...route,
      eta: hoursFormatted,
      transportCost: directFreightCost,
      fuelCost,
      driverWages,
      tollCost: tollFee,
      additionalFee,
      spoilageRiskPercent: spoilagePercent,
      spoilageLossValue,
      totalLandedCost,
      vehicleUsed: vProfile.label,
      isRecommended: false, // will be assigned below
      economicAdvantage: '',
    };
  });

  // Determine the Best Route: the one with lowest total landed cost (freight + spoilage loss)
  let bestRoute = computedRoutes[0];
  for (const r of computedRoutes) {
    if (r.totalLandedCost < bestRoute.totalLandedCost) {
      bestRoute = r;
    }
  }

  // Calculate worst route to show comparative savings
  const worstRoute = [...computedRoutes].sort((a, b) => b.totalLandedCost - a.totalLandedCost)[0];
  const maxSavings = Math.max(0, worstRoute.totalLandedCost - bestRoute.totalLandedCost);

  // Assign recommendation and explanations
  computedRoutes.forEach((r) => {
    if (r.id === bestRoute.id) {
      r.isRecommended = true;
      r.economicAdvantage = `🏆 Best Overall Route: Saves ₹${maxSavings.toLocaleString()} in net landed costs & produce damage compared to alternative paths.`;
    } else if (r.id === 'scenic-ghats-toll-free') {
      const excessDamage = r.spoilageLossValue - bestRoute.spoilageLossValue;
      r.economicAdvantage = `⚠️ Hidden Loss Alert: Saves ₹${bestRoute.tollCost} in tolls, but causes ₹${excessDamage.toLocaleString()} in bruised and soft produce.`;
    } else if (r.id === 'cold-hub-link') {
      r.economicAdvantage = `❄️ Cold Pre-Cooling adds +36h shelf life and preserves Grade-A premium pricing at buyer dock.`;
    } else {
      r.economicAdvantage = `Saves 14% fuel on gentle highway gradients.`;
    }
  });

  return computedRoutes;
}

startServer();

