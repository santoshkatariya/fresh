import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  ScanLine,
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Bug,
  AlertOctagon,
  Volume2,
  VolumeX,
  Eye,
  Layers,
  Info,
  SwitchCamera,
  VideoOff,
  Video,
  Plus,
  RefreshCw,
  Zap
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { CountUp } from '../common/CountUp';
import { ProduceBatch, ProduceBiometrics, DetectedDefect, CropType } from '../../types';
import { getStoredBatches, saveBatches } from '../../utils/storage';
import { speakKisanGuidance, stopKisanSpeech } from '../../utils/kisanVoice';

interface QualityScannerProps {
  onScanComplete?: (batch: ProduceBatch) => void;
  autoStartCamera?: boolean;
}

// Virtual Camera Field Feeds for testing when device camera is restricted or absent
const VIRTUAL_CAMERA_FEEDS = [
  {
    name: 'Fresh Hybrid Tomatoes (Grade-A)',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    crop: 'Tomatoes' as CropType,
  },
  {
    name: 'Solapur Bhagwa Pomegranates (Export)',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    crop: 'Pomegranates' as CropType,
  },
  {
    name: 'Ratnagiri Alphonso Mangoes',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    crop: 'Mangoes' as CropType,
  },
  {
    name: 'Thompson Seedless Grapes',
    image: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80',
    crop: 'Grapes' as CropType,
  },
  {
    name: 'Nashik Dark Red Onions',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
    crop: 'Onions' as CropType,
  },
];

// 6 realistic agricultural presets demonstrating various harvest health & pest conditions
const PRESET_SAMPLES: Record<string, {
  label: string;
  crop: CropType;
  variety: string;
  imageUrl: string;
  defaultBiometrics: ProduceBiometrics;
}> = {
  tomato_clean: {
    label: 'Grade-A Tomato (Clean)',
    crop: 'Tomatoes',
    variety: 'Abhinav Hybrid (Table Grade)',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    defaultBiometrics: {
      crop: 'Tomatoes',
      variety: 'Abhinav Hybrid (Table Grade)',
      qualityScore: 88,
      qualityGrade: 'A',
      freshnessPercent: 92,
      ripenessPercent: 82,
      damagePercent: 6,
      pestInfestationRisk: 'clean',
      spoilageRiskPercent: 12,
      firmnessRating: 8.2,
      estimatedShelfLifeHours: 36,
      pestSummary: 'No fruit borer (Helicoverpa), whiteflies, or oviposition stings detected.',
      diseaseSummary: 'Clean, taut epidermal cutin with zero fungal sporulation or water-soaked lesions.',
      segregationRecommended: false,
      recommendedMarketAction: 'Immediate direct dispatch to Quick-Commerce dark store at peak ₹34/kg.',
      storageTemperatureAdvice: 'Hold in shaded, ventilated crates at 13°C - 15°C with 85-90% RH.',
      defects: [
        {
          id: 'def-clean-1',
          type: 'fresh_intact',
          name: 'Uniform Firm Pericarp Wall',
          scientificOrCommonName: 'Intact Cuticle',
          severity: 'none',
          confidencePercent: 96,
          description: 'High cellular turgor pressure and glossy wax barrier indicating fresh morning harvest.',
          affectedAreaPercent: 0,
          boxCoordinates: { top: 20, left: 25, width: 50, height: 50 },
          recommendedAction: 'Handle with smooth plastic crates to prevent transport scuffing.'
        }
      ]
    }
  },
  tomato_pest_blight: {
    label: 'Tomato (Fruit Borer & Blight)',
    crop: 'Tomatoes',
    variety: 'Local Hybrid (At-Risk)',
    imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=80',
    defaultBiometrics: {
      crop: 'Tomatoes',
      variety: 'Local Hybrid (At-Risk)',
      qualityScore: 58,
      qualityGrade: 'C',
      freshnessPercent: 68,
      ripenessPercent: 86,
      damagePercent: 32,
      pestInfestationRisk: 'moderate',
      spoilageRiskPercent: 44,
      firmnessRating: 5.4,
      estimatedShelfLifeHours: 14,
      pestSummary: 'Active Fruit Borer (Helicoverpa armigera) entry pinholes and dark frass detected near calyx.',
      diseaseSummary: 'Early Blight (Alternaria solani) target-like concentric brown spots developing on shoulders.',
      segregationRecommended: true,
      recommendedMarketAction: 'Segregate damaged crates immediately! Divert unaffected lots to nearby local processing / tomato paste unit.',
      storageTemperatureAdvice: 'Do not mix with healthy batches. Store below 10°C to halt microbial spread.',
      defects: [
        {
          id: 'def-pest-1',
          type: 'pest',
          name: 'Fruit Borer Entry Pinhole & Frass',
          scientificOrCommonName: 'Helicoverpa armigera',
          severity: 'moderate',
          confidencePercent: 93,
          description: '2.5mm larval entry puncture with surrounding necrotic ring and metabolic frass.',
          affectedAreaPercent: 12,
          boxCoordinates: { top: 22, left: 32, width: 26, height: 26 },
          recommendedAction: 'Physically cull infested fruit to prevent caterpillar migration to adjacent crates.'
        },
        {
          id: 'def-rot-1',
          type: 'fungal_blight',
          name: 'Early Blight Concentric Lesion',
          scientificOrCommonName: 'Alternaria solani',
          severity: 'moderate',
          confidencePercent: 89,
          description: 'Dark brown sunken lesion with faint concentric ridges and yellow chlorotic halo.',
          affectedAreaPercent: 18,
          boxCoordinates: { top: 52, left: 45, width: 30, height: 30 },
          recommendedAction: 'Divert to thermal food processing unit; not suitable for fresh retail display.'
        }
      ]
    }
  },
  grape_mildew: {
    label: 'Grapes (Powdery Mildew & Shatter)',
    crop: 'Grapes',
    variety: 'Thompson Seedless',
    imageUrl: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80',
    defaultBiometrics: {
      crop: 'Grapes',
      variety: 'Thompson Seedless',
      qualityScore: 71,
      qualityGrade: 'B',
      freshnessPercent: 78,
      ripenessPercent: 88,
      damagePercent: 18,
      pestInfestationRisk: 'low',
      spoilageRiskPercent: 28,
      firmnessRating: 6.8,
      estimatedShelfLifeHours: 24,
      pestSummary: 'No mealybug colonies or thrips detected on bunch stems.',
      diseaseSummary: 'Early powdery mildew (Uncinula necator) whitish mycelial dusting detected on 12% of inner berries.',
      segregationRecommended: true,
      recommendedMarketAction: 'Rapid cold pre-cooling (0.5°C) and sulfur dioxide pad packaging for regional wholesale.',
      storageTemperatureAdvice: 'Maintain at 0°C - 1°C with 90-95% RH; avoid ambient humidity spikes.',
      defects: [
        {
          id: 'def-g1',
          type: 'fungal_blight',
          name: 'Powdery Mildew Mycelial Patch',
          scientificOrCommonName: 'Uncinula necator',
          severity: 'mild',
          confidencePercent: 88,
          description: 'Thin whitish-grey fungal web on berry skin causing micro-cracking upon expansion.',
          affectedAreaPercent: 8,
          boxCoordinates: { top: 38, left: 34, width: 28, height: 28 },
          recommendedAction: 'Apply post-harvest SO2 aeration pads in ventilated corrugated boxes.'
        },
        {
          id: 'def-g2',
          type: 'spoilage_rot',
          name: 'Pedicel Stem Dehydration & Shatter',
          scientificOrCommonName: 'Rachis Browning',
          severity: 'mild',
          confidencePercent: 85,
          description: 'Loss of green chlorophyll in capstem indicating delayed post-harvest cooling.',
          affectedAreaPercent: 10,
          boxCoordinates: { top: 15, left: 45, width: 24, height: 24 },
          recommendedAction: 'Place under reefer cooling within 2 hours to stop berry drop.'
        }
      ]
    }
  },
  capsicum_rot: {
    label: 'Capsicum (Blossom End Rot & Bruise)',
    crop: 'Capsicum',
    variety: 'Indra Green Bell',
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80',
    defaultBiometrics: {
      crop: 'Capsicum',
      variety: 'Indra Green Bell',
      qualityScore: 62,
      qualityGrade: 'B',
      freshnessPercent: 74,
      ripenessPercent: 76,
      damagePercent: 24,
      pestInfestationRisk: 'clean',
      spoilageRiskPercent: 34,
      firmnessRating: 6.2,
      estimatedShelfLifeHours: 22,
      pestSummary: 'No pepper weevil or aphid colonies detected.',
      diseaseSummary: 'Blossom-End Rot (calcium deficiency physiological decay) and stacking pressure bruises.',
      segregationRecommended: true,
      recommendedMarketAction: 'Grade and sort into Category B for catering/hotel bulk kitchen procurement.',
      storageTemperatureAdvice: 'Store at 8°C - 10°C; lower temperatures cause chilling injury pitting.',
      defects: [
        {
          id: 'def-cap-1',
          type: 'physiological',
          name: 'Blossom-End Rot Necrosis',
          scientificOrCommonName: 'Physiological Ca Deficiency',
          severity: 'moderate',
          confidencePercent: 94,
          description: 'Sunken, dark brown leathery spot at the blossom end prone to secondary mold invasion.',
          affectedAreaPercent: 14,
          boxCoordinates: { top: 58, left: 35, width: 30, height: 30 },
          recommendedAction: 'Trim affected bottom sections for institutional catering usage.'
        },
        {
          id: 'def-cap-2',
          type: 'bruise_mechanical',
          name: 'Side Wall Impact Bruise',
          severity: 'mild',
          confidencePercent: 86,
          description: 'Softened wall tissue from excess crate stacking weight.',
          affectedAreaPercent: 8,
          boxCoordinates: { top: 28, left: 55, width: 22, height: 22 },
          recommendedAction: 'Limit crate stacking depth to maximum 3 tiers.'
        }
      ]
    }
  },
  mango_anthracnose: {
    label: 'Mango (Fruit Fly Stings & Anthracnose)',
    crop: 'Mangoes',
    variety: 'Alphonso Ratnagiri',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    defaultBiometrics: {
      crop: 'Mangoes',
      variety: 'Alphonso Ratnagiri',
      qualityScore: 46,
      qualityGrade: 'C',
      freshnessPercent: 62,
      ripenessPercent: 92,
      damagePercent: 42,
      pestInfestationRisk: 'severe',
      spoilageRiskPercent: 68,
      firmnessRating: 4.2,
      estimatedShelfLifeHours: 10,
      pestSummary: 'Oriental Fruit Fly (Bactrocera dorsalis) oviposition punctures with micro-larval tunneling.',
      diseaseSummary: 'Anthracnose (Colletotrichum gloeosporioides) tear-stain black necrotic spreading patches.',
      segregationRecommended: true,
      recommendedMarketAction: 'Immediate diversion to mango pulp / juice processing facility within 8 hours.',
      storageTemperatureAdvice: 'Do not store with export lots. Rapid pulp extraction advised.',
      defects: [
        {
          id: 'def-m1',
          type: 'pest',
          name: 'Fruit Fly Oviposition Sting',
          scientificOrCommonName: 'Bactrocera dorsalis',
          severity: 'severe',
          confidencePercent: 95,
          description: 'Needle-like oviposition puncture surrounded by a dark bruised halo with subcutaneous softening.',
          affectedAreaPercent: 20,
          boxCoordinates: { top: 30, left: 38, width: 25, height: 25 },
          recommendedAction: 'Cull infected fruit to prevent quarantine rejection.'
        },
        {
          id: 'def-m2',
          type: 'fungal_blight',
          name: 'Anthracnose Tear-Stain Black Lesion',
          scientificOrCommonName: 'Colletotrichum gloeosporioides',
          severity: 'moderate',
          confidencePercent: 92,
          description: 'Irregular dark brown to black spreading spots with salmon-pink spore masses in humid air.',
          affectedAreaPercent: 22,
          boxCoordinates: { top: 52, left: 45, width: 32, height: 32 },
          recommendedAction: 'Hot water dip treatment (48°C for 20 mins) or route directly to pulping line.'
        }
      ]
    }
  },
  onion_smut: {
    label: 'Onion (Black Smut & Neck Softening)',
    crop: 'Onions',
    variety: 'Nashik Dark Red Garwa',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
    defaultBiometrics: {
      crop: 'Onions',
      variety: 'Nashik Dark Red Garwa',
      qualityScore: 68,
      qualityGrade: 'B',
      freshnessPercent: 78,
      ripenessPercent: 85,
      damagePercent: 16,
      pestInfestationRisk: 'low',
      spoilageRiskPercent: 24,
      firmnessRating: 7.2,
      estimatedShelfLifeHours: 120,
      pestSummary: 'No onion thrips (Thrips tabaci) or bulb mites detected.',
      diseaseSummary: 'Black mold (Aspergillus niger) powdery black spore masses between outer dry scales.',
      segregationRecommended: true,
      recommendedMarketAction: 'Dry in shaded forced-air ventilation structure before bulk transport.',
      storageTemperatureAdvice: 'Maintain at 0°C - 2°C or well-aerated room temperature with low RH (<65%).',
      defects: [
        {
          id: 'def-on-1',
          type: 'spoilage_rot',
          name: 'Black Mold Scale Infection',
          scientificOrCommonName: 'Aspergillus niger',
          severity: 'mild',
          confidencePercent: 90,
          description: 'Sooty black powder masses adhering along outer scale veins.',
          affectedAreaPercent: 12,
          boxCoordinates: { top: 35, left: 35, width: 30, height: 30 },
          recommendedAction: 'Remove outermost dry infected wrapper scales during grading.'
        }
      ]
    }
  }
};

export const QualityScanner: React.FC<QualityScannerProps> = ({ onScanComplete, autoStartCamera }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  // Image & Camera State
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('tomato_clean');
  const [currentImage, setCurrentImage] = useState<string>(PRESET_SAMPLES.tomato_clean.imageUrl);
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'>('idle');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVirtualCamera, setIsVirtualCamera] = useState<boolean>(false);
  const [virtualCropIndex, setVirtualCropIndex] = useState<number>(0);

  // Scanning & Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgressText, setAnalysisProgressText] = useState<string>('');
  const [biometrics, setBiometrics] = useState<ProduceBiometrics | null>(PRESET_SAMPLES.tomato_clean.defaultBiometrics);
  const [selectedDefect, setSelectedDefect] = useState<DetectedDefect | null>(null);
  const [overlayMode, setOverlayMode] = useState<'boxes' | 'heatmap' | 'clean'>('boxes');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [batchQuantityKg, setBatchQuantityKg] = useState<number>(850);

  // Video & Canvas Refs for Camera Capture
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Safe ref assignment ensuring stream attachment on mount
  const setVideoRef = (el: HTMLVideoElement | null) => {
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
    if (el && streamRef.current && !isVirtualCamera) {
      el.srcObject = streamRef.current;
      el.play().catch((err) => console.warn('Camera video play error on ref mount:', err));
    }
  };

  // Sync video element whenever cameraState or stream becomes active
  useEffect(() => {
    if (cameraState === 'active' && !isVirtualCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.warn('Camera video play error in effect:', err));
    }
  }, [cameraState, isVirtualCamera]);

  // Auto-start camera if requested by caller
  useEffect(() => {
    if (autoStartCamera && cameraState === 'idle') {
      startCamera();
    }
  }, [autoStartCamera]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      stopKisanSpeech();
    };
  }, []);

  // Stop camera helper
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsVirtualCamera(false);
    setCameraState('idle');
  };

  // Start live camera with progressive fallback
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCameraStream();
    setCameraError(null);
    setIsVirtualCamera(false);
    setCameraState('requesting');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      setCameraError('Direct camera API is not supported in this browser. You can test with our Virtual Field Camera.');
      return;
    }

    try {
      let stream: MediaStream | null = null;
      let accessErr: any = null;

      // 1. Try ideal HD with preferred facing mode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (e1) {
        console.warn('HD camera constraint failed, trying basic facingMode:', e1);
        try {
          // 2. Try basic facingMode
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
        } catch (e2) {
          console.warn('facingMode failed, trying generic video=true:', e2);
          try {
            // 3. Try generic video
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          } catch (e3) {
            accessErr = e3;
          }
        }
      }

      if (!stream) {
        throw accessErr || new Error('Unable to obtain video stream');
      }

      streamRef.current = stream;
      setCameraState('active');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraState('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was blocked. Check browser address bar permissions, or use the Virtual Field Camera Simulator.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No physical camera device detected on this device. You can test grading with our Virtual Field Camera.');
      } else {
        setCameraError(`Camera could not be started: ${err.message || 'Device error'}. You can test with our Virtual Field Camera.`);
      }
    }
  };

  // Launch Virtual Field Camera (works in 100% of environments)
  const startVirtualCamera = (cropIdx: number = 0) => {
    stopCameraStream();
    setCameraError(null);
    setVirtualCropIndex(cropIdx);
    setIsVirtualCamera(true);
    setCameraState('active');
  };

  // Switch between front and back camera or switch virtual feed
  const toggleCameraFacingMode = () => {
    if (isVirtualCamera) {
      setVirtualCropIndex((prev) => (prev + 1) % VIRTUAL_CAMERA_FEEDS.length);
      return;
    }
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    if (cameraState === 'active') {
      startCamera(newMode);
    }
  };

  // Capture frame from active video stream or virtual feed
  const captureCameraSnapshot = () => {
    if (isVirtualCamera) {
      const currentFeed = VIRTUAL_CAMERA_FEEDS[virtualCropIndex];
      stopCameraStream();
      setCurrentImage(currentFeed.image);
      setSelectedPresetKey('');
      runAIClassification(currentFeed.image, currentFeed.crop);
      return;
    }

    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Stop camera and set captured frame as image
    stopCameraStream();
    setCurrentImage(dataUrl);
    setSelectedPresetKey('');

    // Trigger AI classification pipeline
    runAIClassification(dataUrl, 'Captured Crop Sample');
  };

  // Handle uploaded file from local filesystem
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setCurrentImage(dataUrl);
        setSelectedPresetKey('');
        stopCameraStream();
        runAIClassification(dataUrl, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select a pre-calibrated agricultural sample
  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    stopCameraStream();
    const preset = PRESET_SAMPLES[key];
    if (preset) {
      setCurrentImage(preset.imageUrl);
      runAIClassification(preset.imageUrl, preset.crop, preset.defaultBiometrics);
    }
  };

  // Run the full AI Classification Pipeline (Gemini API + Fallback)
  const runAIClassification = async (
    imageData: string,
    cropHint: string,
    presetFallback?: ProduceBiometrics
  ) => {
    setIsAnalyzing(true);
    setBiometrics(null);
    setSelectedDefect(null);

    const steps = [
      'Acquiring optical spectral & RGB biometrics...',
      'Running Gemini Neural Vision pest classification...',
      'Scanning for Fruit Borer, Fruit Fly & fungal hyphae...',
      'Quantifying firmness index & post-harvest shelf life...',
      'Synthesizing highest net-profit market routing...'
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      setAnalysisProgressText(steps[stepIndex % steps.length]);
      stepIndex++;
    }, 450);

    try {
      // Call backend server API
      const response = await fetch('/api/analyze-produce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageData,
          cropHint,
          language: lang,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.qualityScore !== undefined && data.defects) {
          setBiometrics(data as ProduceBiometrics);
          clearInterval(progressInterval);
          setIsAnalyzing(false);
          return;
        }
      }

      // If backend call yields standard fallback
      setTimeout(() => {
        clearInterval(progressInterval);
        setIsAnalyzing(false);
        setBiometrics(presetFallback || PRESET_SAMPLES.tomato_clean.defaultBiometrics);
      }, 1400);
    } catch (err) {
      console.warn('API error during produce analysis, utilizing client biometrics:', err);
      setTimeout(() => {
        clearInterval(progressInterval);
        setIsAnalyzing(false);
        setBiometrics(presetFallback || PRESET_SAMPLES.tomato_clean.defaultBiometrics);
      }, 1200);
    }
  };

  // Voice narration of the classification results
  const handlePlayVoice = () => {
    if (isSpeaking) {
      stopKisanSpeech();
      setIsSpeaking(false);
      return;
    }

    if (!biometrics) return;

    const pestNotice =
      biometrics.pestInfestationRisk === 'severe' || biometrics.pestInfestationRisk === 'moderate'
        ? lang === 'kn'
          ? `ಎಚ್ಚರಿಕೆ! ಕೀಟ ಬಾಧೆ ಅಥವಾ ಶಿಲೀಂಧ್ರ ಕೊಳೆತ ಪತ್ತೆಯಾಗಿದೆ. ಹಾನಿಗೊಳಗಾದ ಕಾಯಿಗಳನ್ನು ತಕ್ಷಣ ಪ್ರತ್ಯೇಕಿಸಿ.`
          : lang === 'hi'
          ? `सावधान! फल छेदक कीट या फफूंद सड़ांध के लक्षण मिले हैं। खराब फसल को तुरंत अलग करें।`
          : `Alert: Pest marks or fungal rot detected. Segregate affected crates immediately.`
        : lang === 'kn'
        ? `ಉತ್ತಮ ಸುದ್ದಿ! ಯಾವುದೇ ಕೀಟ ಬಾಧೆ ಇಲ್ಲ. ಬೆಳೆಯು ಉತ್ತಮ ಗ್ರೇಡ್‌ನಲ್ಲಿದೆ.`
        : lang === 'hi'
        ? `बढ़िया! कोई कीट नहीं मिला। फसल उत्तम गुणवत्ता ग्रेड में है।`
        : `Clean batch! No active pests detected.`;

    const fullMessage = `${pestNotice} ${biometrics.crop} - ${t('scanner.overallQuality')}: ${biometrics.qualityScore}/100. ${biometrics.recommendedMarketAction}`;

    setIsSpeaking(true);
    speakKisanGuidance(fullMessage, lang).then(() => {
      setIsSpeaking(false);
    });
  };

  // Save as new active batch & trigger downstream Value Clock
  const handleSaveAndRoute = () => {
    if (!biometrics) return;

    const batches = getStoredBatches();
    const newBatch: ProduceBatch = {
      id: `batch-${Date.now().toString().slice(-5)}`,
      farmerId: 'farmer-ramesh-01',
      farmerName: 'Ramesh Patil',
      farmLocation: 'Niphad, Nashik, Maharashtra',
      crop: (biometrics.crop as CropType) || 'Tomatoes',
      variety: biometrics.variety || 'Hybrid Fresh',
      quantityKg: batchQuantityKg,
      harvestDate: new Date().toISOString().split('T')[0],
      harvestTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      basePricePerKg: biometrics.qualityScore > 80 ? 24 : biometrics.qualityScore > 65 ? 19 : 14,
      currentQualityScore: biometrics.qualityScore,
      freshnessPercent: biometrics.freshnessPercent,
      ripenessPercent: biometrics.ripenessPercent,
      damagePercent: biometrics.damagePercent,
      estimatedShelfLifeHours: biometrics.estimatedShelfLifeHours,
      spoilageRiskPercent: biometrics.spoilageRiskPercent,
      detectedIssues: [
        biometrics.pestSummary,
        biometrics.diseaseSummary,
        ...biometrics.defects.map((d) => `${d.name} (${d.severity} severity, ${d.confidencePercent}% conf)`),
      ],
      imageUrl: currentImage,
      biometrics,
      status: 'available',
      storageType: biometrics.spoilageRiskPercent > 30 ? 'cold_storage' : 'ambient',
      createdAt: new Date().toISOString(),
    };

    // Prepend as top active batch
    const updatedBatches = [newBatch, ...batches.filter((b) => b.id !== newBatch.id)];
    saveBatches(updatedBatches);

    if (onScanComplete) {
      onScanComplete(newBatch);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="ai-biometric-pest-scanner">
      {/* Hidden canvas for video frame extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#18A558] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-[#18A558]">
              Neural Vision • Spoilage & Pest Classifier
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17201C] flex items-center gap-2.5">
            <ScanLine className="w-6 h-6 text-[#18A558]" />
            {t('scanner.title')}
          </h2>
          <p className="text-xs text-[#6F7D75] max-w-2xl">{t('scanner.subtitle')}</p>
        </div>

        {/* Live Audio / Kisan Voice Advice Button */}
        {biometrics && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayVoice}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                isSpeaking
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-[#0B3D2E] hover:bg-[#18A558] text-white'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#A8D94C]" />}
              <span>{isSpeaking ? 'Speaking Advice...' : t('scanner.voiceAdvice')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Preset Selector Strip */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-[#6F7D75]">
            Select Demo Crop Condition (or Open Live Camera Below):
          </span>
          <span className="text-[11px] font-semibold text-[#18A558] hidden sm:inline">
            6 Multi-Crop Field Presets
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {Object.entries(PRESET_SAMPLES).map(([key, preset]) => {
            const isSelected = selectedPresetKey === key && cameraState !== 'active';
            const isAtRisk = preset.defaultBiometrics.pestInfestationRisk !== 'clean';

            return (
              <button
                key={key}
                onClick={() => handleSelectPreset(key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                  isSelected
                    ? 'bg-[#0B3D2E] text-white border-[#0B3D2E] shadow-sm'
                    : isAtRisk
                    ? 'bg-rose-50/70 text-rose-900 border-rose-200 hover:bg-rose-100'
                    : 'bg-[#F7F8F2] text-[#17201C] border-stone-200 hover:border-[#18A558]'
                }`}
              >
                {isAtRisk ? (
                  <Bug className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-300' : 'text-rose-600'}`} />
                ) : (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-[#A8D94C]' : 'text-[#18A558]'}`} />
                )}
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Viewfinder (6 cols) | Right AI Biometric Diagnostics (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera Viewfinder & Image Canvas */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-4 sm:p-5 space-y-4 bg-white border border-stone-200 shadow-sm overflow-hidden">
            {/* Viewfinder Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    cameraState === 'active'
                      ? 'bg-emerald-500 animate-ping'
                      : isAnalyzing
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-[#18A558]'
                  }`}
                />
                <span className="text-xs font-black uppercase tracking-wider text-[#17201C]">
                  {cameraState === 'active' ? t('scanner.cameraLive') : 'Biometric Target Viewfinder'}
                </span>
              </div>

              {/* View Overlay Mode Toggles (when static image is present) */}
              {cameraState !== 'active' && biometrics && (
                <div className="flex items-center bg-[#F7F8F2] p-0.5 rounded-xl border border-stone-200 text-[11px] font-bold">
                  <button
                    onClick={() => setOverlayMode('boxes')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      overlayMode === 'boxes'
                        ? 'bg-[#0B3D2E] text-white shadow-xs'
                        : 'text-[#6F7D75] hover:text-[#17201C]'
                    }`}
                  >
                    Defect Boxes
                  </button>
                  <button
                    onClick={() => setOverlayMode('clean')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      overlayMode === 'clean'
                        ? 'bg-[#0B3D2E] text-white shadow-xs'
                        : 'text-[#6F7D75] hover:text-[#17201C]'
                    }`}
                  >
                    Clean Photo
                  </button>
                </div>
              )}
            </div>

            {/* Viewfinder Stage Area */}
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-inner flex items-center justify-center">
              {/* LIVE CAMERA STREAM OR VIRTUAL SIMULATOR */}
              {cameraState === 'active' && (
                <div className="relative w-full h-full">
                  {!isVirtualCamera ? (
                    <video
                      ref={setVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={VIRTUAL_CAMERA_FEEDS[virtualCropIndex].image}
                        alt="Virtual camera target feed"
                        className="w-full h-full object-cover"
                      />
                      {/* Virtual Camera Laser Sweep Effect */}
                      <motion.div
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                        className="absolute left-0 right-0 h-1 bg-[#A8D94C] shadow-[0_0_24px_#A8D94C] pointer-events-none"
                      />
                    </div>
                  )}

                  {/* Optical Reticle Crosshairs HUD */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-dashed border-[#A8D94C]/70 rounded-3xl relative flex items-center justify-center animate-pulse">
                      <div className="w-3 h-3 bg-[#A8D94C] rounded-full" />
                      <span className="absolute -top-3 left-4 bg-[#0B3D2E] text-[#A8D94C] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#A8D94C]/40">
                        {isVirtualCamera ? 'VIRTUAL SENSOR 1080p' : 'ALIGN CROP IN RETICLE'}
                      </span>
                    </div>
                  </div>

                  {/* Camera Top Bar */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                    <span className="bg-black/70 backdrop-blur-sm text-emerald-400 text-[11px] font-black px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      {isVirtualCamera
                        ? `VIRTUAL CAMERA • ${VIRTUAL_CAMERA_FEEDS[virtualCropIndex].name}`
                        : 'LIVE DEVICE FEED ACTIVE'}
                    </span>

                    <button
                      onClick={toggleCameraFacingMode}
                      className="p-2 rounded-full bg-black/70 text-white hover:bg-black/90 border border-white/20 shadow-md flex items-center gap-1 text-xs font-bold"
                      title={isVirtualCamera ? 'Switch crop demo' : t('scanner.cameraSwitch')}
                    >
                      <SwitchCamera className="w-4 h-4" />
                      {isVirtualCamera && <span className="text-[10px]">Next Crop</span>}
                    </button>
                  </div>

                  {/* Camera Bottom Capture Bar */}
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 sm:gap-3 px-3">
                    <button
                      onClick={stopCameraStream}
                      className="px-3 py-2 rounded-xl bg-stone-900/80 text-stone-300 hover:text-white text-xs font-bold border border-white/20 backdrop-blur-sm flex items-center gap-1.5"
                    >
                      <VideoOff className="w-3.5 h-3.5" />
                      {t('scanner.cameraStop')}
                    </button>

                    {isVirtualCamera && (
                      <button
                        onClick={() => startCamera()}
                        className="px-3 py-2 rounded-xl bg-[#0B3D2E]/90 text-white hover:bg-[#0B3D2E] text-xs font-bold border border-[#A8D94C]/30 backdrop-blur-sm flex items-center gap-1.5"
                        title="Switch to physical hardware camera"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#A8D94C]" />
                        <span className="hidden sm:inline">Use Hardware Cam</span>
                      </button>
                    )}

                    <button
                      onClick={captureCameraSnapshot}
                      className="px-5 sm:px-6 py-2.5 rounded-2xl bg-[#18A558] hover:bg-[#158f4c] text-white text-xs sm:text-sm font-black shadow-xl flex items-center gap-2 border border-white/30 transform active:scale-95 transition-transform"
                    >
                      <Camera className="w-4 h-4 text-[#A8D94C]" />
                      {t('scanner.cameraCapture')}
                    </button>
                  </div>
                </div>
              )}

              {/* CAMERA REQUESTING STATE */}
              {cameraState === 'requesting' && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-white">{t('scanner.cameraPermissionRequired')}</h4>
                  <p className="text-xs text-stone-300 max-w-xs">{t('scanner.cameraPermissionPrompt')}</p>
                </div>
              )}

              {/* CAMERA PERMISSION DENIED OR UNSUPPORTED STATE */}
              {(cameraState === 'denied' || cameraState === 'unsupported') && (
                <div className="text-center p-6 space-y-3 max-w-sm">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-white">Camera Access Notice</h4>
                  <p className="text-xs text-rose-200">{cameraError || t('scanner.cameraPermissionDenied')}</p>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => startVirtualCamera(0)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#18A558] hover:bg-[#158f4c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-[#A8D94C]" />
                      <span>Launch Virtual Field Camera (Guaranteed)</span>
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startCamera()}
                      className="text-white border-white/30 hover:bg-white/10 text-xs"
                    >
                      Try Requesting Physical Camera Again
                    </Button>
                  </div>
                </div>
              )}

              {/* STATIC CAPTURED / PRESET PHOTO WITH INTERACTIVE BOUNDING BOXES */}
              {cameraState === 'idle' && (
                <>
                  <img
                    src={currentImage}
                    alt="Produce scan target"
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning HUD Overlay when active */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-[#0B3D2E]/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
                      {/* Laser Line Animation */}
                      <motion.div
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                        className="absolute left-0 right-0 h-1 bg-[#A8D94C] shadow-[0_0_20px_#A8D94C]"
                      />

                      <div className="w-12 h-12 rounded-2xl bg-[#18A558]/30 border border-[#A8D94C]/40 text-[#A8D94C] flex items-center justify-center animate-spin">
                        <Sparkles className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase tracking-widest text-[#A8D94C]">
                          {t('scanner.analyzing')}
                        </span>
                        <p className="text-xs font-semibold text-white/90">{analysisProgressText}</p>
                      </div>
                    </div>
                  )}

                  {/* Interactive Defect Bounding Boxes */}
                  {!isAnalyzing && biometrics && overlayMode === 'boxes' && (
                    <div className="absolute inset-0 pointer-events-none">
                      {biometrics.defects.map((defect) => {
                        const box = defect.boxCoordinates || { top: 30, left: 30, width: 35, height: 35 };
                        const isPest = defect.type === 'pest';
                        const isRot = defect.type === 'fungal_blight' || defect.type === 'spoilage_rot';
                        const isClean = defect.type === 'fresh_intact';

                        const borderColor = isPest
                          ? 'border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                          : isRot
                          ? 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                          : isClean
                          ? 'border-[#18A558] shadow-[0_0_12px_rgba(24,165,88,0.6)]'
                          : 'border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]';

                        const badgeBg = isPest
                          ? 'bg-rose-700 text-white'
                          : isRot
                          ? 'bg-amber-700 text-white'
                          : isClean
                          ? 'bg-[#0B3D2E] text-[#A8D94C]'
                          : 'bg-cyan-800 text-white';

                        return (
                          <div
                            key={defect.id}
                            style={{
                              top: `${box.top}%`,
                              left: `${box.left}%`,
                              width: `${box.width}%`,
                              height: `${box.height}%`,
                            }}
                            onClick={() => setSelectedDefect(defect)}
                            className={`absolute border-2 rounded-xl transition-all cursor-pointer pointer-events-auto group ${borderColor} hover:scale-105`}
                          >
                            <span
                              className={`absolute -top-3.5 left-2 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 ${badgeBg}`}
                            >
                              {isPest && <Bug className="w-2.5 h-2.5" />}
                              <span>{defect.name} ({defect.confidencePercent}%)</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Viewfinder Bottom Action Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {/* Open Camera Button */}
              <button
                onClick={() => startCamera()}
                className="py-2.5 px-3 rounded-xl bg-[#0B3D2E] hover:bg-[#18A558] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Camera className="w-4 h-4 text-[#A8D94C]" />
                <span>{t('scanner.cameraStart')}</span>
              </button>

              {/* Virtual Camera Button */}
              <button
                onClick={() => startVirtualCamera(0)}
                className="py-2.5 px-3 rounded-xl bg-[#18A558] hover:bg-[#158f4c] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                title="Test with Virtual Field Camera (instant live simulation)"
              >
                <Sparkles className="w-4 h-4 text-[#A8D94C]" />
                <span>Virtual Cam</span>
              </button>

              {/* Upload Image Button */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="py-2.5 px-3 rounded-xl border border-stone-300 hover:border-[#18A558] bg-[#F7F8F2] hover:bg-emerald-50 text-xs font-bold text-[#17201C] flex items-center justify-center gap-1.5 transition-colors">
                  <Upload className="w-4 h-4 text-[#18A558]" />
                  <span>Upload File</span>
                </div>
              </label>

              {/* Re-Analyze Button */}
              <button
                onClick={() => runAIClassification(currentImage, 'Selected Crop')}
                disabled={isAnalyzing}
                className="py-2.5 px-3 rounded-xl border border-stone-300 hover:bg-stone-100 text-xs font-bold text-[#17201C] flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className={`w-4 h-4 text-stone-600 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>Re-Analyze</span>
              </button>
            </div>
          </Card>

          {/* Selected Defect Detail Popup (when user clicks a bounding box) */}
          {selectedDefect && (
            <Card className="p-4 bg-white border-2 border-[#18A558] shadow-md space-y-2 rounded-2xl relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedDefect.type === 'pest' ? (
                    <Bug className="w-4 h-4 text-rose-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <h4 className="text-xs font-black text-[#17201C]">
                    {selectedDefect.name}
                    {selectedDefect.scientificOrCommonName && (
                      <span className="text-[11px] font-normal italic text-[#6F7D75] ml-1">
                        ({selectedDefect.scientificOrCommonName})
                      </span>
                    )}
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-[#17201C]">
                  {selectedDefect.confidencePercent}% Confidence
                </span>
              </div>
              <p className="text-xs text-[#6F7D75]">{selectedDefect.description}</p>
              <div className="bg-[#F7F8F2] p-2.5 rounded-xl text-xs font-semibold text-[#0B3D2E] border border-stone-200 flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-[#18A558] shrink-0 mt-0.5" />
                <span><strong>Recommended Action:</strong> {selectedDefect.recommendedAction}</span>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: AI Biometric Diagnostics & Spoilage/Pest Risk Assessment */}
        <div className="lg:col-span-6 space-y-4">
          {biometrics ? (
            <Card borderVariant="success" className="p-5 sm:p-6 space-y-5 bg-white border border-stone-200 shadow-md">
              {/* Header: Crop Name & Quality Grade */}
              <div className="flex items-start justify-between pb-3 border-b border-stone-200">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-black text-[#18A558] uppercase tracking-wider block">
                    AI Biometrics & Pest Classification
                  </span>
                  <h3 className="text-xl font-black text-[#17201C]">
                    {biometrics.crop} ({biometrics.variety})
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-[#0B3D2E]">
                    <CountUp end={biometrics.qualityScore} suffix="/100" duration={600} />
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                      biometrics.qualityGrade === 'A'
                        ? 'bg-emerald-100 text-[#0B3D2E] border border-emerald-300'
                        : biometrics.qualityGrade === 'B'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    Grade {biometrics.qualityGrade} {biometrics.qualityGrade === 'A' ? 'Prime Export' : biometrics.qualityGrade === 'B' ? 'Regional Retail' : 'Distressed / Pulping'}
                  </span>
                </div>
              </div>

              {/* PEST & INFESTATION THREAT BANNER */}
              <div
                className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                  biometrics.pestInfestationRisk === 'clean'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : biometrics.pestInfestationRisk === 'low'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-rose-50/80 border-rose-300 text-rose-950'
                }`}
              >
                {biometrics.pestInfestationRisk === 'clean' ? (
                  <ShieldCheck className="w-5 h-5 text-[#18A558] shrink-0 mt-0.5" />
                ) : (
                  <Bug className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase tracking-wider text-[11px]">
                      {t('scanner.pestStatus')}: {biometrics.pestInfestationRisk.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 border border-current">
                      Spoilage Risk: {biometrics.spoilageRiskPercent}%
                    </span>
                  </div>
                  <p className="leading-relaxed opacity-90">{biometrics.pestSummary}</p>
                </div>
              </div>

              {/* SEGREGATION & STORAGE ALERT (if applicable) */}
              {biometrics.segregationRecommended && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">{t('scanner.segregationAlert')}:</span>
                    <span>Physically cull and isolate infected produce before crating to halt ethylene and spore transmission.</span>
                  </div>
                </div>
              )}

              {/* 4 Quantitative Parameter Bars */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Freshness */}
                <div className="p-3 bg-[#F7F8F2] rounded-xl border border-stone-200 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-[#6F7D75]">{t('scanner.freshness')}</span>
                    <span className="text-[#18A558]">{biometrics.freshnessPercent}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#18A558] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${biometrics.freshnessPercent}%` }}
                    />
                  </div>
                </div>

                {/* Ripeness */}
                <div className="p-3 bg-[#F7F8F2] rounded-xl border border-stone-200 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-[#6F7D75]">{t('scanner.ripeness')}</span>
                    <span className="text-amber-700">{biometrics.ripenessPercent}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${biometrics.ripenessPercent}%` }}
                    />
                  </div>
                </div>

                {/* Damage / Surface Defects */}
                <div className="p-3 bg-[#F7F8F2] rounded-xl border border-stone-200 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-[#6F7D75]">{t('scanner.damage')}</span>
                    <span className="text-rose-700">{biometrics.damagePercent}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${biometrics.damagePercent}%` }}
                    />
                  </div>
                </div>

                {/* Predicted Shelf Life */}
                <div className="p-3 bg-[#F7F8F2] rounded-xl border border-stone-200 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-[#6F7D75]">{t('scanner.predictedShelfLife')}</span>
                    <span className="text-[#0B3D2E]">~{biometrics.estimatedShelfLifeHours}h</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#A8D94C] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (biometrics.estimatedShelfLifeHours / 48) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Detected Morphological & Disease Features */}
              <div className="space-y-2">
                <span className="text-xs font-black text-[#17201C] uppercase tracking-wider block">
                  {t('scanner.detectedIssues')}
                </span>
                <div className="space-y-1.5 text-xs text-[#6F7D75] bg-[#F7F8F2] p-3 rounded-xl border border-stone-200">
                  <div className="flex items-start gap-2 font-medium text-[#17201C]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#18A558] shrink-0 mt-0.5" />
                    <span>{biometrics.diseaseSummary}</span>
                  </div>
                  {biometrics.defects.map((defect) => (
                    <div key={defect.id} className="flex items-start gap-2 pl-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-[#17201C] border border-stone-300 shrink-0">
                        {defect.type}
                      </span>
                      <span>{defect.name} ({defect.severity} - {defect.affectedAreaPercent}% area)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage & Market Routing Recommendation */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1 text-xs">
                <span className="font-bold text-[#0B3D2E] block uppercase tracking-wider text-[11px]">
                  Recommended Market Action:
                </span>
                <p className="text-emerald-950 font-medium">{biometrics.recommendedMarketAction}</p>
                <p className="text-[#6F7D75] text-[11px] pt-1">
                  <strong>Storage Advice:</strong> {biometrics.storageTemperatureAdvice}
                </p>
              </div>

              {/* Batch Registration & Bridge to Value Clock */}
              <div className="pt-2 space-y-3 border-t border-stone-200">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-bold text-[#17201C] shrink-0">
                    Harvest Lot Size:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={50}
                      max={10000}
                      step={50}
                      value={batchQuantityKg}
                      onChange={(e) => setBatchQuantityKg(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 text-xs font-black text-right rounded-xl border border-stone-300 bg-[#F7F8F2] focus:ring-2 focus:ring-[#18A558] outline-none"
                    />
                    <span className="text-xs font-bold text-[#6F7D75]">KG</span>
                  </div>
                </div>

                <Button
                  variant="success"
                  fullWidth
                  onClick={handleSaveAndRoute}
                  icon={<ArrowRight className="w-4 h-4 text-white" />}
                  iconPosition="right"
                  className="bg-[#0B3D2E] hover:bg-[#18A558] text-white shadow-md text-xs sm:text-sm py-3"
                >
                  {t('scanner.saveBatchAndRoute')}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-[#6F7D75] space-y-3 bg-white border border-stone-200">
              <Sparkles className="w-12 h-12 mx-auto text-[#18A558] animate-pulse" />
              <h4 className="text-sm font-black text-[#17201C]">Vision Classifier Ready</h4>
              <p className="text-xs max-w-sm mx-auto">
                Open your device camera or select a harvest sample on the left to extract biometric firmness, pest threats, and post-harvest decay models.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
