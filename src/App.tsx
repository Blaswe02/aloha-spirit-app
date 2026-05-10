/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, ReactNode, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palmtree, 
  MapPin, 
  Sparkles, 
  Heart, 
  ChevronRight, 
  Moon, 
  Sun,
  Compass,
  Waves,
  BookOpen,
  X,
  ArrowLeft,
  ArrowRight,
  User,
  GraduationCap
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Types ---

type SceneId = 
  | 'student-id'
  | 'welcome'
  | 'vocabulary-match'
  | 'welcome-intro'
  | 'shuttle-ride'
  | 'hawaiian-words-story'
  | 'hawaiian-recall'
  | 'summary-gap-fill'
  | 'welcome-tour-1'
  | 'welcome-tour-2'
  | 'welcome-tour-3'
  | 'welcome-tour-4'
  | 'welcome-tour-5'
  | 'village-clues'
  | 'sort-clues'
  | 'tour-notebook'
  | 'scenic-route-1'
  | 'scenic-route-2'
  | 'scenic-route-3'
  | 'scenic-route-4'
  | 'sort-facts'
  | 'true-false-check'
  | 'timeline-check'
  | 'reflection-task'
  | 'intro-true-false'
  | 'village-woman-1'
  | 'village-woman-2'
  | 'meet-guide'
  | 'start-tour'
  | 'landmark'
  | 'sacred-place'
  | 'talisman-glow'
  | 'cabin-glow-1'
  | 'cabin-glow-2'
  | 'companion-forming'
  | 'selection' 
  | 'reveal'
  | 'naming'
  | 'first-conversation'
  | 'end-check'
  | 'final-unlock';

interface Companion {
  id: string;
  name: string;
  type: 'Owl' | 'Sea Turtle' | 'Gecko' | 'Fox' | 'Deer';
  style: 'wise' | 'calm' | 'playful' | 'brave' | 'gentle';
  traits: string[];
  revealText: string;
  lines: string[];
  helpExplanation: string;
  tempName: string;
  color: string;
  icon: string;
}

// --- Data ---

const SCENE_ASSETS = {
  scene1: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene1.png",
  scene2: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene2.png",
  scene3: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene3.png",
  scene4: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene4.png",
  scene5: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene5.png",
  scene6: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene6.png",
  scene7: "https://images.unsplash.com/photo-1505852673533-5b87999120de?auto=format&fit=crop&q=80&w=2000",
  scene8: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene8.png",
  scene9: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene9.png",
  scene10: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene10.png",
  scene11: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene11.png",
  scene12: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene12.png",
  scene13: "https://images.unsplash.com/photo-1621213450917-8178129e924a?auto=format&fit=crop&q=80&w=2000",
  scene14: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene14.png",
  scene15: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene15.png",
  scene16: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene16.png",
  scene17: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene17.png",
  nightTour: "/src/assets/images/hawaii_night_tour_scene_1778411390620.png",
  fox: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene20.png",
  owl: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene21.png",
  gecko: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene22.png",
  deer: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene23.png",
  turtle: "https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene24.png",
};

const getBackgroundImage = (scene: SceneId): string | null => {
  if (scene === 'student-id' || scene === 'welcome' || scene === 'welcome-intro') return SCENE_ASSETS.scene1;
  if (scene === 'vocabulary-match') return SCENE_ASSETS.scene2;
  if (scene === 'shuttle-ride' || scene === 'summary-gap-fill') return SCENE_ASSETS.scene3;
  if (['hawaiian-words-story', 'hawaiian-recall'].includes(scene)) return SCENE_ASSETS.scene4;
  if (scene === 'welcome-tour-1') return SCENE_ASSETS.scene5;
  if (scene === 'welcome-tour-2') return SCENE_ASSETS.scene6;
  if (scene === 'welcome-tour-3') return SCENE_ASSETS.scene7;
  if (['welcome-tour-4', 'welcome-tour-5', 'start-tour', 'landmark'].includes(scene)) return SCENE_ASSETS.scene8;
  if (['village-clues', 'sort-clues', 'tour-notebook', 'sacred-place'].includes(scene)) return SCENE_ASSETS.scene9;
  if (['scenic-route-1', 'scenic-route-4'].includes(scene)) return SCENE_ASSETS.scene10;
  if (['sort-facts', 'true-false-check', 'timeline-check', 'reflection-task', 'intro-true-false'].includes(scene)) return SCENE_ASSETS.scene11;
  if (['scenic-route-2', 'scenic-route-3'].includes(scene)) return SCENE_ASSETS.scene12;
  if (scene === 'village-woman-1') return SCENE_ASSETS.scene14;
  if (scene === 'village-woman-2') return SCENE_ASSETS.scene15;
  if (['meet-guide', 'talisman-glow'].includes(scene)) return SCENE_ASSETS.scene15;
  if (scene === 'cabin-glow-1') return SCENE_ASSETS.scene16;
  if (['cabin-glow-2', 'companion-forming', 'selection', 'reveal', 'naming', 'first-conversation', 'end-check', 'final-unlock'].includes(scene)) return SCENE_ASSETS.scene17;
  return null;
};

const END_CHECK_QUESTIONS = [
  {
    category: 'Vocabulary',
    question: 'What does “mahalo” mean?',
    options: ['thank you', 'family', 'ocean', 'child'],
    correct: 'thank you',
    feedback: '“Yes. Mahalo means thank you.”'
  },
  {
    category: 'Vocabulary',
    question: 'What does “kai” mean?',
    options: ['child', 'sea or ocean', 'goodbye', 'family'],
    correct: 'sea or ocean',
    feedback: '“Yes. Kai means sea or ocean.”'
  },
  {
    category: 'Culture / History',
    question: 'Who united the Hawaiian Islands?',
    options: ['King Kamehameha', 'the tour guide', 'an American president', 'a Japanese leader'],
    correct: 'King Kamehameha',
    feedback: '“Yes. King Kamehameha united the islands.”'
  },
  {
    category: 'Culture / History',
    question: 'Which countries later had important influence on Hawaii?',
    options: ['Japan and America', 'Spain and Italy', 'Brazil and Canada', 'India and China'],
    correct: 'Japan and America',
    feedback: '“Yes. Japanese and American influences became important in Hawaii later.”'
  },
  {
    category: 'Reflection',
    question: 'Why do you think the talisman came to you?',
    options: [
      'because I was lucky',
      'because I helped and noticed something small',
      'because I was tired',
      'because I arrived first'
    ],
    correct: 'because I helped and noticed something small',
    feedback: '“You noticed something others ignored. That is why the companion awakened for you.”'
  }
];

const COMPANIONS: Companion[] = [
  {
    id: 'owl',
    name: 'Pueo',
    type: 'Owl',
    style: 'wise',
    traits: ['wise', 'observant', 'thoughtful'],
    revealText: 'A calm owl spirit appears in the light, watching you with bright, thoughtful eyes. “I will help you look carefully,” it says. “Some places speak softly, but they still have much to say.”',
    lines: ['“I will help you look carefully,” it says. “Some places speak softly, but they still have much to say.”'],
    helpExplanation: 'This companion helps you understand culture, history, and deeper meaning.',
    tempName: 'The Watcher',
    color: 'bg-deep-sea',
    icon: 'owl'
  },
  {
    id: 'turtle',
    name: 'Honu',
    type: 'Sea Turtle',
    style: 'calm',
    traits: ['calm', 'patient', 'steady'],
    revealText: 'A glowing sea turtle rises gently from the light, calm and steady. “I will travel beside you,” it says. “Not every lesson must be fast. Some things take time to understand.”',
    lines: ['“I will travel beside you,” it says. “Not every lesson must be fast. Some things take time to understand.”'],
    helpExplanation: 'This companion helps you stay calm, reflect, and connect with Hawaiʻi through respect and balance.',
    tempName: 'The Navigator',
    color: 'bg-turquoise',
    icon: 'turtle'
  },
  {
    id: 'gecko',
    name: 'Mo\'o',
    type: 'Gecko',
    style: 'playful',
    traits: ['playful', 'curious', 'clever'],
    revealText: 'A small glowing gecko appears and moves lightly through the warm spirit light. “I can help you learn in clever ways,” it says. “Not every guide has to be serious.”',
    lines: ['“I can help you learn in clever ways,” it says. “Not every guide has to be serious.”'],
    helpExplanation: 'This companion helps you with energy, encouragement, and playful support.',
    tempName: 'The Spark',
    color: 'bg-palm',
    icon: 'gecko'
  },
  {
    id: 'fox',
    name: 'Fox Spirit',
    type: 'Fox',
    style: 'brave',
    traits: ['brave', 'alert', 'adventurous'],
    revealText: 'A bright fox spirit steps out of the glowing light with sharp eyes and a luminous tail. “I will help you move forward,” it says. “Sometimes the best path begins with one brave step.”',
    lines: ['“I will help you move forward,” it says. “Sometimes the best path begins with one brave step.”'],
    helpExplanation: 'This companion helps you with confidence, curiosity, and discovery.',
    tempName: 'The Shield',
    color: 'bg-coral',
    icon: 'fox'
  },
  {
    id: 'deer',
    name: 'Deer Spirit',
    type: 'Deer',
    style: 'gentle',
    traits: ['gentle', 'peaceful', 'respectful'],
    revealText: 'A gentle deer spirit appears in the light, calm and quiet, with a soft glow around it. “I will walk with care,” it says. “Some places ask for respect before they share their story.”',
    lines: ['“I will walk with care,” it says. “Some places ask for respect before they share their story.”'],
    helpExplanation: 'This companion helps you reflect, respect nature, and notice emotional meaning.',
    tempName: 'The Whisper',
    color: 'bg-sand-dark',
    icon: 'deer'
  }
];

// --- Logic for Stop Navigation ---
interface StopScene {
  id: SceneId;
  label: string;
  type: 'story' | 'task';
  title: string;
}

interface SceneStop {
  id: string;
  name: string;
  scenes: StopScene[];
}

const SCENE_STOPS: SceneStop[] = [
  {
    id: '0',
    name: 'Identification',
    scenes: [
      { id: 'student-id', label: '0.0', type: 'story', title: 'Start' }
    ]
  },
  {
    id: '1',
    name: 'Arrival',
    scenes: [
      { id: 'welcome', label: '1.0', type: 'story', title: 'Airport Arrival' },
      { id: 'vocabulary-match', label: '1.1', type: 'task', title: 'Arrival Memories' }
    ]
  },
  {
    id: '2',
    name: 'The Journey',
    scenes: [
      { id: 'welcome-intro', label: '2.0', type: 'story', title: 'Aloha and Welcome to Hawaiʻi' },
      { id: 'intro-true-false', label: '2.1', type: 'task', title: 'Guide Check' },
      { id: 'shuttle-ride', label: '2.2', type: 'story', title: 'Ride Through Nature' },
      { id: 'hawaiian-words-story', label: '2.3', type: 'story', title: 'Hawaiian Words' },
      { id: 'hawaiian-recall', label: '2.4', type: 'task', title: 'Hawaiian Word Recall' },
      { id: 'summary-gap-fill', label: '2.5', type: 'task', title: 'Gap Fill Summary' }
    ]
  },
  {
    id: '3',
    name: 'Village Tour',
    scenes: [
      { id: 'welcome-tour-1', label: '3.0', type: 'story', title: 'Entering the Village' },
      { id: 'welcome-tour-2', label: '3.1', type: 'story', title: 'Watching and Learning' },
      { id: 'welcome-tour-3', label: '3.2', type: 'story', title: 'Searching for Meaning' },
      { id: 'welcome-tour-4', label: '3.3', type: 'story', title: 'Learning about Culture' },
      { id: 'welcome-tour-5', label: '3.4', type: 'story', title: 'Seeing the Community' },
      { id: 'village-clues', label: '3.5', type: 'task', title: 'Finding Village Clues' },
      { id: 'sort-clues', label: '3.6', type: 'task', title: 'Organizing the Evidence' },
      { id: 'tour-notebook', label: '3.7', type: 'task', title: 'The Guide’s Notebook' }
    ]
  },
  {
    id: '4',
    name: 'Scenic Route',
    scenes: [
      { id: 'scenic-route-1', label: '4.0', type: 'story', title: 'Looking at the Coast' },
      { id: 'scenic-route-2', label: '4.1', type: 'story', title: 'High in the Mountains' },
      { id: 'scenic-route-3', label: '4.2', type: 'story', title: 'Into the Valley' },
      { id: 'scenic-route-4', label: '4.3', type: 'story', title: 'Connecting the Pieces' },
      { id: 'sort-facts', label: '4.4', type: 'task', title: 'Sorting the Truth' },
      { id: 'true-false-check', label: '4.5', type: 'task', title: 'True or False Check' },
      { id: 'timeline-check', label: '4.6', type: 'task', title: 'The History Timeline' },
      { id: 'reflection-task', label: '4.7', type: 'task', title: 'Personal Reflection' }
    ]
  },
  {
    id: '5',
    name: 'Observation',
    scenes: [
      { id: 'village-woman-1', label: '5.0', type: 'story', title: 'The Quiet Woman' },
      { id: 'village-woman-2', label: '5.1', type: 'story', title: 'The Encounter' }
    ]
  },
  {
    id: '6',
    name: 'Landmarks',
    scenes: [
      { id: 'meet-guide', label: '6.0', type: 'story', title: 'The Real Guide' },
      { id: 'start-tour', label: '6.1', type: 'story', title: 'Secret Paths' },
      { id: 'landmark', label: '6.2', type: 'story', title: 'Sacred Landmark' },
      { id: 'sacred-place', label: '6.3', type: 'story', title: 'A Healing Place' }
    ]
  },
  {
    id: '7',
    name: 'The Talisman',
    scenes: [
      { id: 'talisman-glow', label: '7.0', type: 'story', title: 'Magical Object' },
      { id: 'cabin-glow-1', label: '7.1', type: 'story', title: 'The Light' },
      { id: 'cabin-glow-2', label: '7.2', type: 'story', title: 'The Vision' }
    ]
  },
  {
    id: '8',
    name: 'Awakening',
    scenes: [
      { id: 'companion-forming', label: '8.0', type: 'story', title: 'Spirit Forming' },
      { id: 'selection', label: '8.1', type: 'story', title: 'Your Guide Choice' },
      { id: 'reveal', label: '8.2', type: 'story', title: 'The Spirit Reveals' },
      { id: 'naming', label: '8.3', type: 'story', title: 'Naming your Guide' },
      { id: 'first-conversation', label: '8.4', type: 'story', title: 'First Words' },
      { id: 'end-check', label: '8.5', type: 'task', title: 'Final Review' },
      { id: 'final-unlock', label: '8.6', type: 'story', title: 'Gateway' }
    ]
  }
];

// --- Components ---

export default function App() {
  const [currentScene, setCurrentScene] = useState<SceneId>('student-id');
  const [firstName, setFirstName] = useState('');
  const [classGroup, setClassGroup] = useState('');
  const [taskReturnScene, setTaskReturnScene] = useState<SceneId | null>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [companionName, setCompanionName] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [alohaAnswered, setAlohaAnswered] = useState(false);
  const [alohaCorrect, setAlohaCorrect] = useState(false);
  const [shuttleAnswered, setShuttleAnswered] = useState(false);
  const [mahaloAnswered, setMahaloAnswered] = useState(false);
  const [kaiAnswered, setKaiAnswered] = useState(false);
  const [vocabMatches, setVocabMatches] = useState<Record<string, string>>({});
  const [vocabFeedback, setVocabFeedback] = useState(false);
  const [vocabCheckAttempted, setVocabCheckAttempted] = useState(false);
  const [hawaiianRecallMatches, setHawaiianRecallMatches] = useState<Record<string, string>>({});
  const [hawaiianRecallFeedback, setHawaiianRecallFeedback] = useState(false);
  const [gapFillAnswers, setGapFillAnswers] = useState<Record<string, string>>({});
  const [gapFillFeedback, setGapFillFeedback] = useState(false);
  const [villageCluesAnswers, setVillageCluesAnswers] = useState<string[]>([]);
  const [villageCluesFeedback, setVillageCluesFeedback] = useState(false);
  const [villageCluesAttempted, setVillageCluesAttempted] = useState(false);
  const [sortCluesAnswers, setSortCluesAnswers] = useState<Record<string, string>>({});
  const [sortCluesFeedback, setSortCluesFeedback] = useState(false);
  const [notebookNotes, setNotebookNotes] = useState({ culture: '', nature: '', dailyLife: '' });
  const [notebookFeedback, setNotebookFeedback] = useState(false);
  
  // Scenic Route Tasks State
  const [sortFactsAnswers, setSortFactsAnswers] = useState<Record<string, string>>({});
  const [sortFactsFeedback, setSortFactsFeedback] = useState(false);
  const [sortFactsAttempted, setSortFactsAttempted] = useState(false);
  
  const [trueFalseStep, setTrueFalseStep] = useState(0);
  const [trueFalseFeedback, setTrueFalseFeedback] = useState<string | null>(null);
  const [trueFalseCorrect, setTrueFalseCorrect] = useState<boolean | null>(null);
  
  const [timelineOrder, setTimelineOrder] = useState<string[]>([]);
  const [timelineFeedback, setTimelineFeedback] = useState(false);
  const [timelineAttempted, setTimelineAttempted] = useState(false);
  
  const [reflectionAnswers, setReflectionAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);

  const [cultureAnswered, setCultureAnswered] = useState(false);
  const [cultureCorrect, setCultureCorrect] = useState(false);
  const [villageWomanAnswered, setVillageWomanAnswered] = useState(false);
  const [villageWomanChoice, setVillageWomanChoice] = useState('');
  const [cabinGlowAnswered, setCabinGlowAnswered] = useState(false);
  const [cabinGlowChoice, setCabinGlowChoice] = useState('');
  const [conversationAnswers, setConversationAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [conversationSubmitted, setConversationSubmitted] = useState(false);
  const [endCheckStep, setEndCheckStep] = useState(0);
  const [endCheckFeedback, setEndCheckFeedback] = useState<string | null>(null);
  const [endCheckCorrect, setEndCheckCorrect] = useState<boolean | null>(null);

  // Intro Comprehension Task State
  const [introAnswers, setIntroAnswers] = useState<Record<number, boolean | null>>({});
  const [showIntroResults, setShowIntroResults] = useState(false);
  
  // Navigation & Story Recall State
  const [visitedScenes, setVisitedScenes] = useState<Set<SceneId>>(new Set(['welcome']));
  const [isStoryNavigatorOpen, setIsStoryNavigatorOpen] = useState(false);
  const [activeTaskScene, setActiveTaskScene] = useState<SceneId | null>(null);
  
  useEffect(() => {
    setVisitedScenes(prev => {
      if (prev.has(currentScene)) return prev;
      const next = new Set(prev);
      next.add(currentScene);
      return next;
    });
  }, [currentScene]);

  // AI Companion State
  // Teacher Mode State
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [titleClickCount, setTitleClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleAlohaAnswer = (option: string) => {
    setAlohaAnswered(true);
    setAlohaCorrect(option === 'all of these');
  };

  const getCompanionImage = (type: string) => {
    switch(type) {
      case 'Fox': return SCENE_ASSETS.fox;
      case 'Owl': return SCENE_ASSETS.owl;
      case 'Gecko': return SCENE_ASSETS.gecko;
      case 'Deer': return SCENE_ASSETS.deer;
      case 'Sea Turtle': return SCENE_ASSETS.turtle;
      default: return '';
    }
  };

  const scenes: Record<SceneId, number> = {
    'student-id': 0,
    'welcome': 2,
    'vocabulary-match': 4,
    'welcome-intro': 5,
    'intro-true-false': 6,
    'shuttle-ride': 8,
    'hawaiian-words-story': 12,
    'hawaiian-recall': 15,
    'summary-gap-fill': 18,
    'welcome-tour-1': 21,
    'welcome-tour-2': 24,
    'welcome-tour-3': 27,
    'welcome-tour-4': 30,
    'welcome-tour-5': 33,
    'village-clues': 36,
    'sort-clues': 39,
    'tour-notebook': 42,
    'scenic-route-1': 45,
    'scenic-route-2': 48,
    'scenic-route-3': 51,
    'scenic-route-4': 54,
    'sort-facts': 57,
    'true-false-check': 60,
    'timeline-check': 63,
    'reflection-task': 66,
    'village-woman-1': 69,
    'village-woman-2': 72,
    'meet-guide': 75,
    'start-tour': 78,
    'landmark': 81,
    'sacred-place': 84,
    'talisman-glow': 87,
    'cabin-glow-1': 90,
    'cabin-glow-2': 92,
    'companion-forming': 94,
    'selection': 95,
    'reveal': 96,
    'naming': 97,
    'first-conversation': 98,
    'end-check': 99,
    'final-unlock': 100
  };

  useEffect(() => {
    setProgress(scenes[currentScene]);
  }, [currentScene]);

  const saveCompletion = async () => {
    try {
      if (firstName && classGroup && selectedCompanion) {
        await addDoc(collection(db, 'journeys'), {
          firstName,
          classGroup,
          spiritAnimal: selectedCompanion.type,
          companionName: companionName,
          answers: conversationAnswers,
          completed: true,
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error saving completion:", error);
    }
  };

  const nextScene = (id: SceneId) => {
    setCurrentScene(id);
    setActiveTaskScene(null); // Clear active task if moving forward
    if (id === 'final-unlock') {
      saveCompletion();
    }
  };

  const goToStory = (storyId: SceneId) => {
    setTaskReturnScene(currentScene);
    setCurrentScene(storyId);
  };

  const jumpToStoryPage = (pageId: SceneId) => {
    // If we are currently on a task, remember it
    const currentStop = SCENE_STOPS.find(s => s.scenes.some(p => p.id === currentScene));
    if (currentStop) {
      const currentSceneInfo = currentStop.scenes.find(s => s.id === currentScene);
      if (currentSceneInfo?.type === 'task') {
        setActiveTaskScene(currentScene);
      }
    }
    setCurrentScene(pageId);
    setIsStoryNavigatorOpen(false);
  };

  useEffect(() => {
    if (currentScene === taskReturnScene) {
      setTaskReturnScene(null);
    }
  }, [currentScene, taskReturnScene]);

  return (
    <div className="min-h-screen flex flex-col tropical-gradient font-sans selection:bg-turquoise/30 overflow-x-hidden relative">
      {/* Fixed Scene Backgrounds */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={getBackgroundImage(currentScene) || 'default'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: getBackgroundImage(currentScene) ? `url(${getBackgroundImage(currentScene)})` : 'none',
              backgroundColor: getBackgroundImage(currentScene) ? 'transparent' : 'var(--color-sand)'
            }}
          >
            {/* Soft overlay for readability */}
            <div className="absolute inset-0 bg-sand/60 backdrop-blur-[2px]" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            x: [0, 20, 0],
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 text-palm/5 opacity-20"
        >
          <Palmtree size={400} />
        </motion.div>
        <motion.div 
          animate={{ 
            x: [0, -30, 0],
            y: [0, 30, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 text-turquoise/5 opacity-20"
        >
          <Waves size={500} />
        </motion.div>
        <div className="absolute top-1/4 right-10 text-coral/5 opacity-10">
          <Sun size={150} />
        </div>
      </div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-sand-dark bg-white/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-deep-sea rounded-2xl flex items-center justify-center text-white shadow-xl shadow-deep-sea/20 rotate-[-3deg]">
            <Palmtree size={24} />
          </div>
          <div 
            onClick={() => {
              const now = Date.now();
              const timeDiff = now - lastClickTime;
              setLastClickTime(now);

              setTitleClickCount(prev => {
                // Reset if clicks are more than 1 second apart
                const next = timeDiff < 1000 ? prev + 1 : 1;
                if (next >= 5) {
                  setShowPasscodeModal(true);
                  return 0;
                }
                return next;
              });
            }} 
            className="cursor-default select-none group"
          >
            <h1 className="font-display font-bold text-xl tracking-tight text-deep-sea leading-none transition-colors">Aloha Spirit</h1>
            <p className="text-[10px] font-bold text-turquoise uppercase tracking-[0.2em] mt-1.5">Lesson 1: The Night Tour</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:text-right">
            <p className="text-[10px] font-bold text-palm/40 uppercase tracking-widest font-display">Your Journey</p>
            <p className="text-xs font-bold text-deep-sea">{Math.round(progress)}% Complete</p>
          </div>
          <div className="w-32 h-2.5 bg-sand-dark rounded-full overflow-hidden p-0.5">
            <motion.div 
              className="h-full bg-turquoise rounded-full shadow-[0_0_10px_rgba(72,201,176,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-10 max-w-5xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          {currentScene === 'student-id' && (
            <SceneWrapper key="student-id">
              <TourStopIndicator current={1} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-2xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-deep-sea/10 text-deep-sea rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display">
                    Welcome to the Journey
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-serif font-medium text-deep-sea">Who is joining us today?</h2>
                  <p className="text-text-muted italic font-serif text-xl">Please enter your details to begin your Hawaii adventure.</p>
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-turquoise uppercase tracking-[0.2em] font-display">
                        <User size={14} />
                        First Name
                      </label>
                      <input 
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        className="w-full p-6 bg-sand/30 border-2 border-sand-dark rounded-[2rem] focus:ring-4 focus:ring-turquoise/20 focus:border-turquoise outline-none font-serif text-lg text-deep-sea transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-turquoise uppercase tracking-[0.2em] font-display">
                        <GraduationCap size={14} />
                        Class
                      </label>
                      <input 
                        type="text"
                        value={classGroup}
                        onChange={(e) => setClassGroup(e.target.value)}
                        placeholder="Enter your class (e.g., 3A)"
                        className="w-full p-6 bg-sand/30 border-2 border-sand-dark rounded-[2rem] focus:ring-4 focus:ring-turquoise/20 focus:border-turquoise outline-none font-serif text-lg text-deep-sea transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => nextScene('welcome')}
                    disabled={!firstName.trim() || !classGroup.trim()}
                    className="w-full bg-deep-sea text-white py-6 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    Start the Lesson
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'welcome' && (
            <SceneWrapper key="welcome">
              <TourStopIndicator current={2} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-coral/10 text-coral rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <MapPin size={12} />
                    Airport Arrival
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    Airport Arrival
                  </h2>
                  <p className="text-text-muted italic font-serif text-xl">Your journey begins at the edge of the ocean.</p>
                </div>

                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="rounded-3xl overflow-hidden shadow-xl aspect-[3/4] relative">
                      <img 
                        src={SCENE_ASSETS.scene1} 
                        alt="Hawaii Arrival" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-4 text-text-main leading-relaxed text-sm sm:text-base">
                      <p>
                        After a long flight, you finally arrive in Hawaiʻi. The warm air feels different right away. Outside the airport, you see palm trees, flowers, and people in light summer clothes. Everything feels calm, bright, and new.
                      </p>
                      <p>
                        A friendly tour guide is waiting for you near the exit with a small sign. He smiles and says, “Aloha! Welcome to Hawaiʻi.”
                      </p>
                      <p>
                        As you walk with him, he starts telling you more about the place you have just arrived in.
                      </p>
                      <p className="font-serif text-lg text-deep-sea italic">
                        “Hawaiʻi is a group of islands in the Pacific Ocean,” he says. “It is also the 50th state of the United States of America.”
                      </p>
                      <p>
                        You look surprised, so he laughs softly.
                      </p>
                      <p>
                        “Yes, it is part of the USA,” he says, “but Hawaiʻi also has its own strong culture, history, and traditions.”
                      </p>
                      <p className="font-medium text-deep-sea">
                         He mentions that many people know Hawaiʻi because of its volcanoes, surfing, and military history.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-sand-dark/30 flex justify-center">
                    <button 
                      onClick={() => nextScene('vocabulary-match')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center gap-3"
                    >
                      Step into the Shuttle
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'vocabulary-match' && (
            <SceneWrapper key="vocabulary-match">
              <TourStopIndicator current={3} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-turquoise/10 text-turquoise rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <BookOpen size={12} />
                    Language Skills
                  </div>
                  <h2 className="text-4xl font-serif text-deep-sea">Vocabulary Check</h2>
                  <p className="text-text-muted italic font-serif text-xl">Match each description to the correct word from the reading text.</p>
                  <StoryRecallButton onOpen={() => setIsStoryNavigatorOpen(true)} />
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  {/* Left Side: Images */}
                  <div className="space-y-6">
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] relative border-4 border-white">
                      <img 
                        src={SCENE_ASSETS.scene2} 
                        alt="The Guide" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  {/* Descriptions */}
                  <div className="space-y-4">
                    {[
                      { id: '1', text: 'the most important city in a state or country', word: 'capital' },
                      { id: '2', text: 'a mountain that can erupt with hot lava', word: 'volcano' },
                      { id: '3', text: 'a language that a country or state officially uses', word: 'official language' },
                      { id: '4', text: 'a piece of cloth with colours and symbols for a country or place', word: 'flag' },
                      { id: '5', text: 'a place of land surrounded by water', word: 'island' },
                      { id: '6', text: 'the ideas, traditions, and way of life of a group of people', word: 'culture' },
                      { id: '7', text: 'wars, soldiers, and important events from the past connected to the army', word: 'military history' },
                      { id: '8', text: 'a Hawaiian word that can mean hello, goodbye, and love', word: 'aloha' },
                    ].map((item) => {
                      const isCorrect = vocabCheckAttempted && vocabMatches[item.id] === item.word;
                      const isWrong = vocabCheckAttempted && vocabMatches[item.id] && vocabMatches[item.id] !== item.word;
                      
                      return (
                        <div 
                          key={item.id}
                          className={`p-6 rounded-[2rem] border transition-all flex flex-col gap-4 ${
                            isCorrect ? 'bg-palm/10 border-palm/20 shadow-lg shadow-palm/10' : 
                            isWrong ? 'bg-coral/10 border-coral/20 shadow-lg shadow-coral/10' :
                            vocabMatches[item.id] ? 'bg-turquoise/5 border-turquoise/20 shadow-lg shadow-turquoise/10' : 'bg-white border-sand-dark shadow-sm'
                          }`}
                        >
                          <p className="text-xl text-black font-serif italic leading-snug">{item.text}</p>
                          <div className="flex flex-wrap gap-2">
                            {['aloha', 'official language', 'capital', 'volcano', 'island', 'culture', 'flag', 'military history'].map(word => (
                              <button
                                key={word}
                                disabled={vocabFeedback}
                                onClick={() => {
                                  setVocabMatches(prev => ({ ...prev, [item.id]: word }));
                                  setVocabCheckAttempted(false);
                                }}
                                className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all border ${
                                  vocabMatches[item.id] === word 
                                    ? 'bg-deep-sea border-deep-sea text-white shadow-md' 
                                    : 'bg-sand/30 border-sand-dark text-black hover:border-turquoise hover:text-turquoise'
                                }`}
                              >
                                {word}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback and Continue */}
                  <div className="space-y-6">
                    <div className="journal-card p-8 sticky top-24">
                      <h3 className="text-2xl font-serif text-deep-sea mb-2">Check your progress</h3>
                      <p className="text-sm text-text-muted mb-8 font-serif italic">Match all 8 words correctly to continue.</p>
                      
                      {Object.keys(vocabMatches).length === 8 && !vocabFeedback && (
                        <button 
                          onClick={() => {
                            const correctAnswers: Record<string, string> = {
                              '1': 'capital', '2': 'volcano', '3': 'official language', '4': 'flag',
                              '5': 'island', '6': 'culture', '7': 'military history', '8': 'aloha'
                            };
                            const allCorrect = Object.entries(correctAnswers).every(([id, word]) => vocabMatches[id] === word);
                            if (allCorrect) {
                              setVocabFeedback(true);
                            } else {
                              setVocabCheckAttempted(true);
                            }
                          }}
                          className="w-full bg-deep-sea text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                        >
                          Check Answers
                        </button>
                      )}

                      {vocabCheckAttempted && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-6 bg-coral/10 text-coral rounded-2xl text-center space-y-3 border border-coral/20"
                        >
                          <p className="font-serif italic text-lg">Not everything is correct yet. Check your answers and try again.</p>
                          <button 
                            onClick={() => setVocabCheckAttempted(false)}
                            className="text-[10px] font-bold uppercase tracking-widest underline hover:opacity-70"
                          >
                            Try Again
                          </button>
                        </motion.div>
                      )}

                      {vocabFeedback && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-8"
                        >
                          <div className="p-6 bg-turquoise/10 text-deep-sea rounded-2xl space-y-2 text-center border border-turquoise/20">
                            <p className="font-serif italic text-lg">Good job. These words will help you understand more about Hawaiʻi.</p>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-40">Vocabulary Mastered</p>
                          </div>
                          <button 
                            onClick={() => nextScene('welcome-intro')}
                            className="w-full bg-turquoise text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-deep-sea transition-all shadow-xl shadow-turquoise/20"
                          >
                            Continue Journey
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'welcome-intro' && (
            <SceneWrapper key="welcome-intro">
              <TourStopIndicator current={4} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-coral/10 text-coral rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <MapPin size={12} />
                    Hawaiʻi Statehood
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    Aloha and Welcome to Hawaiʻi
                  </h2>
                  <p className="text-text-muted italic font-serif text-xl">Discovering the heart of the capital.</p>
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-8">
                  <div className="space-y-6 text-text-main leading-relaxed text-base sm:text-lg font-serif">
                    <p>
                      The guide points to a map on the wall near the airport entrance while you prepare to leave the terminal.
                    </p>
                    <p className="font-medium text-deep-sea text-xl">
                      “The capital city is Honolulu,” he explains. “It is on the island of Oʻahu. Honolulu is a busy, modern city, but it is also the place where the Royal Palace is located.”
                    </p>
                    <p>
                      While you walk outside toward the parking area, he keeps talking about the history of the islands.
                    </p>
                    <p>
                      “In Hawaiʻi, tradition is everywhere. We were an independent kingdom once, before we became part of the United States.”
                    </p>
                    <p>
                      You notice a flag flying nearby. It looks different from other American flags you have seen.
                    </p>
                    <p className="bg-sand/30 p-6 rounded-2xl border-l-4 border-deep-sea">
                      “That flag is important,” the guide says. “The Hawaiian flag has the Union Jack on it—the British flag—because of early contact with the United Kingdom. It shows our long connection to different countries around the world.”
                    </p>
                    <p className="text-[10px] text-text-muted/50 break-all font-mono text-center">
                      Source: https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/flaghawaii.png
                    </p>

                    <div className="flex justify-center my-8">
                      <div className="relative max-w-md w-full rounded-xl overflow-hidden shadow-2xl border-4 border-white rotate-1">
                        <img 
                          src="https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/flaghawaii.png" 
                          alt="Hawaiian Flag" 
                          className="w-full h-auto"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 border border-sand-dark/20 rounded-xl pointer-events-none" />
                      </div>
                    </div>
                    <p>
                      The guide opens the door of a small shuttle bus and waits for you to get in.
                    </p>
                    <p className="italic text-text-muted">
                      “We are going to take the scenic route,” he states. “You will see how nature and city life exist side by side here.”
                    </p>
                  </div>
                  
                  <div className="pt-8 border-t border-sand-dark/30 flex justify-center">
                    <button 
                      onClick={() => nextScene('intro-true-false')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center gap-3"
                    >
                      Take Your Seat
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'intro-true-false' && (
            <SceneWrapper key="intro-true-false">
              <TourStopIndicator current={5} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-2xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-deep-sea/10 text-deep-sea rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display">
                    Guide Check
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-serif font-medium text-deep-sea">Guide Check</h2>
                  <p className="text-text-muted italic font-serif text-xl">True or false? What do you remember from what the guide just told you?</p>
                  <StoryRecallButton onOpen={() => setIsStoryNavigatorOpen(true)} />
                </div>

                <div className="journal-card p-6 sm:p-10 space-y-8">
                  <div className="space-y-6">
                    {[
                      { q: "Honolulu is the capital city of Hawaiʻi.", a: true },
                      { q: "Honolulu is on the island of Oʻahu.", a: true },
                      { q: "The Hawaiian flag includes the Union Jack because of early contact with the United Kingdom.", a: true },
                      { q: "Hawaiʻi is only famous for beaches.", a: false, ex: "Hawaiʻi is also famous for volcanoes, surfing, culture, biodiversity, and military history." },
                      { q: "Hawaiʻi was once an independent kingdom before becoming part of the United States.", a: true }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-4 p-4 rounded-2xl bg-sand/20 border border-sand-dark/30">
                        <p className="text-lg font-serif text-deep-sea">{item.q}</p>
                        {!showIntroResults ? (
                          <div className="flex gap-4">
                            <button 
                              onClick={() => setIntroAnswers(prev => ({...prev, [idx]: true}))}
                              className={`px-6 py-2 rounded-full font-display font-bold text-xs uppercase tracking-widest transition-all ${introAnswers[idx] === true ? 'bg-deep-sea text-white shadow-lg' : 'bg-white text-deep-sea border border-sand-dark hover:border-turquoise'}`}
                            >
                              True
                            </button>
                            <button 
                              onClick={() => setIntroAnswers(prev => ({...prev, [idx]: false}))}
                              className={`px-6 py-2 rounded-full font-display font-bold text-xs uppercase tracking-widest transition-all ${introAnswers[idx] === false ? 'bg-deep-sea text-white shadow-lg' : 'bg-white text-deep-sea border border-sand-dark hover:border-turquoise'}`}
                            >
                              False
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className={`font-bold uppercase text-[10px] tracking-widest ${introAnswers[idx] === item.a ? 'text-palm' : 'text-coral'}`}>
                                {introAnswers[idx] === item.a ? '✓ Correct' : '✗ Incorrect'}
                              </span>
                              <span className="text-xs text-text-muted">| Correct answer: <span className="font-bold text-deep-sea">{item.a ? 'True' : 'False'}</span></span>
                            </div>
                            {item.ex && !item.a && (
                              <p className="text-sm italic text-text-muted font-serif border-l-2 border-sand-dark pl-3 py-1">
                                {item.ex}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-sand-dark/30 flex flex-col items-center gap-6">
                    {!showIntroResults ? (
                      <button 
                        disabled={Object.keys(introAnswers).length < 5}
                        onClick={() => setShowIntroResults(true)}
                        className="bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 disabled:opacity-50"
                      >
                        Check Answers
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-6 text-center"
                      >
                        <div className="p-6 bg-palm/10 text-palm rounded-[2rem] border border-palm/20">
                          <p className="font-serif italic text-lg">Good. Now you know a little more about Hawaiʻi before the journey continues.</p>
                        </div>
                        <button 
                          onClick={() => nextScene('shuttle-ride')}
                          className="group bg-turquoise text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-deep-sea transition-all shadow-xl shadow-turquoise/20 flex items-center gap-3 mx-auto"
                        >
                          Continue Journey
                          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'shuttle-ride' && (
            <SceneWrapper key="shuttle-ride">
              <TourStopIndicator current={6} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-palm/10 text-palm rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <Compass size={12} />
                    The Green Heart
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    Ride Through Nature
                  </h2>
                  <p className="text-text-muted italic font-serif text-xl">The island reveals its green heart.</p>
                </div>

                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0 items-stretch">
                    <div className="p-8 sm:p-12 space-y-6 text-text-main leading-relaxed text-base sm:text-lg font-serif">
                      <p>
                        You sit in the small shuttle bus and look out of the window. The road moves away from the airport and into a greener, quieter part of Hawaiʻi.
                      </p>
                      <p>
                        Outside, you see tall trees, tropical plants, hills, and the soft colours of the evening sky. In the distance, you can still see the ocean.
                      </p>
                      <p>
                        Your guide smiles and points outside.
                      </p>
                      <div className="p-6 bg-sand/50 rounded-[2rem] border border-sand-dark italic text-deep-sea relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-sand-dark">
                          <Palmtree size={16} className="text-palm" />
                        </div>
                        “This is one of the special things about Hawaiʻi,” he says. “Nature is never far away. The islands are famous for their beaches, but also for mountains, volcanoes, plants, animals, and beautiful landscapes.”
                      </div>
                    </div>
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                      <img 
                        src={SCENE_ASSETS.scene3} 
                        alt="Hawaii Nature" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-sea/40 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Island Interior</p>
                        <p className="font-serif italic">Lush landscapes and evening light</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 sm:p-12 space-y-6 text-text-main leading-relaxed text-base sm:text-lg font-serif border-t border-sand-dark/50">
                    <p>
                      The bus turns onto a smaller road.
                    </p>
                    <p className="font-serif text-lg text-deep-sea italic">
                      “Hawaiʻi has strong biodiversity too,” the guide says. “That means many different plants and animals live here.”
                    </p>
                    <p>
                      He looks at you through the mirror and laughs.
                    </p>
                    <p className="font-display font-bold text-turquoise uppercase tracking-[0.2em] text-xs">
                      “Still awake?” he asks. “Let’s check what you remember.”
                    </p>
                  </div>
                  
                  <div className="p-8 bg-sand-dark/30 flex justify-center">
                    <button 
                      onClick={() => nextScene('hawaiian-words-story')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center gap-3"
                    >
                      Continue Journey
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'hawaiian-words-story' && (
            <SceneWrapper key="hawaiian-words-story">
              <TourStopIndicator current={7} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-turquoise/10 text-turquoise rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <BookOpen size={12} />
                    Language and Culture
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    Hawaiian Words
                  </h2>
                  <p className="text-text-muted italic font-serif text-xl">Learning the sounds of the islands.</p>
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-8">
                  <div className="space-y-6 text-text-main leading-relaxed text-base sm:text-lg font-serif">
                    <p>
                      As the shuttle continues, the guide turns to you again. “I want to tell you more about our language,” he says.
                    </p>
                    <p>
                      “Hawaiian is special because it uses only 12 signs or symbols. But those few letters can say so much about how we see the world.”
                    </p>
                    <p>
                      He hands you a small card with some common words written on it.
                    </p>
                    
                    <div className="bg-deep-sea p-8 rounded-[2.5rem] border border-deep-sea/20 space-y-6 shadow-2xl">
                      <div className="flex items-center gap-3 border-b border-white/20 pb-4">
                        <Sparkles className="text-turquoise" size={24} />
                        <h3 className="text-white font-display font-bold uppercase tracking-[0.2em] text-sm">Key Hawaiian Vocabulary</h3>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                          <p className="text-turquoise font-bold text-xl mb-1">Aloha</p>
                          <p className="text-white/80 text-sm italic">Hello, goodbye, love, and compassion</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                          <p className="text-turquoise font-bold text-xl mb-1">ʻOhana</p>
                          <p className="text-white/80 text-sm italic">Family (in the widest sense)</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                          <p className="text-turquoise font-bold text-xl mb-1">Mahalo</p>
                          <p className="text-white/80 text-sm italic">Thank you, gratitude</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                          <p className="text-turquoise font-bold text-xl mb-1">Keiki</p>
                          <p className="text-white/80 text-sm italic">Child, children</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors sm:col-span-2">
                          <p className="text-turquoise font-bold text-xl mb-1">Kai</p>
                          <p className="text-white/80 text-sm italic">The sea or the ocean</p>
                        </div>
                      </div>
                    </div>

                    <p className="pt-4">
                      “Every word has a deeper meaning here,” the guide explains. “Aloha is not just a greeting; it’s a way of living with kindness. ʻOhana means that nobody is left behind.”
                    </p>
                    <p>
                      You look at the words and try to say them softly. The guide nods in approval. “Good! You are already a student of Hawaiʻi.”
                    </p>
                  </div>
                  
                  <div className="pt-8 border-t border-sand-dark/30 flex justify-center">
                    <button 
                      onClick={() => nextScene('hawaiian-recall')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center gap-3"
                    >
                      Start Word Practice
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'hawaiian-recall' && (
            <SceneWrapper key="hawaiian-recall">
              <TourStopIndicator current={8} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-turquoise/10 text-turquoise rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <BookOpen size={12} />
                    Language Recall
                  </div>
                  <h2 className="text-4xl font-serif text-deep-sea">Task 1: Hawaiian Words</h2>
                  <p className="text-text-muted italic font-serif text-xl">Match the Hawaiian word to the English meaning.</p>
                  <StoryRecallButton onOpen={() => setIsStoryNavigatorOpen(true)} />
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] relative border-4 border-white">
                      <img 
                        src={SCENE_ASSETS.scene4} 
                        alt="Bus Window View" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-sea/20 to-transparent" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { id: 'aloha', text: 'hello, goodbye, love', word: 'Aloha' },
                      { id: 'ohana', text: 'family', word: 'ʻOhana' },
                      { id: 'mahalo', text: 'thank you', word: 'Mahalo' },
                      { id: 'keiki', text: 'child', word: 'Keiki' },
                      { id: 'kai', text: 'sea or ocean', word: 'Kai' },
                    ].map((item) => {
                      const isCorrect = hawaiianRecallFeedback && hawaiianRecallMatches[item.id] === item.word;
                      const isWrong = hawaiianRecallFeedback && hawaiianRecallMatches[item.id] && hawaiianRecallMatches[item.id] !== item.word;

                      return (
                        <div 
                          key={item.id}
                          className={`p-6 rounded-[2rem] border transition-all flex flex-col gap-4 ${
                            isCorrect ? 'bg-palm/10 border-palm/20 shadow-lg shadow-palm/10' : 
                            isWrong ? 'bg-coral/10 border-coral/20 shadow-lg shadow-coral/10' :
                            hawaiianRecallMatches[item.id] ? 'bg-turquoise/5 border-turquoise/20 shadow-lg shadow-turquoise/10' : 'bg-white border-sand-dark shadow-sm'
                          }`}
                        >
                          <p className="text-xl text-black font-serif italic leading-snug">{item.text}</p>
                          <div className="flex flex-wrap gap-2">
                            {['Aloha', 'ʻOhana', 'Mahalo', 'Keiki', 'Kai'].map(word => (
                              <button
                                key={word}
                                disabled={hawaiianRecallFeedback && hawaiianRecallMatches[item.id] === item.word}
                                onClick={() => {
                                  setHawaiianRecallMatches(prev => ({ ...prev, [item.id]: word }));
                                  setHawaiianRecallFeedback(false);
                                }}
                                className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all border ${
                                  hawaiianRecallMatches[item.id] === word 
                                    ? 'bg-deep-sea border-deep-sea text-white shadow-md' 
                                    : 'bg-sand/30 border-sand-dark text-black hover:border-turquoise hover:text-turquoise'
                                }`}
                              >
                                {word}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-6">
                    <div className="journal-card p-8 sticky top-24">
                      <h3 className="text-2xl font-serif text-deep-sea mb-2">Check your memory</h3>
                      <p className="text-sm text-text-muted mb-8 font-serif italic">Match all 5 words correctly to continue.</p>
                      
                      {Object.keys(hawaiianRecallMatches).length === 5 && !hawaiianRecallFeedback && (
                        <button 
                          onClick={() => {
                            const correctAnswers: Record<string, string> = {
                              'aloha': 'Aloha', 'ohana': 'ʻOhana', 'mahalo': 'Mahalo', 'keiki': 'Keiki', 'kai': 'Kai'
                            };
                            const allCorrect = Object.entries(correctAnswers).every(([id, word]) => hawaiianRecallMatches[id] === word);
                            if (allCorrect) {
                              setHawaiianRecallFeedback(true);
                            } else {
                              setHawaiianRecallFeedback(false);
                            }
                          }}
                          className="w-full bg-deep-sea text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                        >
                          Check Answers
                        </button>
                      )}

                      {hawaiianRecallFeedback ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-8"
                        >
                          <div className="p-6 bg-turquoise/10 text-deep-sea rounded-2xl space-y-2 text-center border border-turquoise/20">
                            <p className="font-serif italic text-lg">Well done. You still remember the Hawaiian words from the start of the journey.</p>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-40">Memory Verified</p>
                          </div>
                          <button 
                            onClick={() => nextScene('summary-gap-fill')}
                            className="w-full bg-turquoise text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-deep-sea transition-all shadow-xl shadow-turquoise/20"
                          >
                            Continue to Summary
                          </button>
                        </motion.div>
                      ) : Object.keys(hawaiianRecallMatches).length === 5 && (
                        <div className="mt-6 p-6 bg-coral/10 text-coral rounded-2xl text-center border border-coral/20">
                           <p className="font-serif italic text-lg text-coral">Not everything is correct yet. Check your answers and try again.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'summary-gap-fill' && (
            <SceneWrapper key="summary-gap-fill">
              <TourStopIndicator current={9} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-5xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-turquoise/10 text-turquoise rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <BookOpen size={12} />
                    Writing Skills
                  </div>
                  <h2 className="text-4xl font-serif text-deep-sea">Task 2: Gap Fill Summary</h2>
                  <p className="text-text-muted italic font-serif text-xl">Complete the summary with the correct words from the word bank.</p>
                  <StoryRecallButton onOpen={() => setIsStoryNavigatorOpen(true)} />
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                  <div className="md:col-span-2 space-y-6">
                    <div className="journal-card p-8 sm:p-12">
                    <div className="space-y-8 text-text-main leading-relaxed font-serif text-lg sm:text-xl">
                      <p>
                        You arrive in <span className="inline-block min-w-[100px] border-b-2 border-turquoise/30 text-turquoise font-bold text-center px-2">{gapFillAnswers[1] || '__(1)__'}</span> after a long flight. It is a group of <span className="inline-block min-w-[100px] border-b-2 border-turquoise/30 text-turquoise font-bold text-center px-2">{gapFillAnswers[2] || '__(2)__'}</span> in the Pacific Ocean and also the 50th <span className="inline-block min-w-[100px] border-b-2 border-turquoise/30 text-turquoise font-bold text-center px-2">{gapFillAnswers[3] || '__(3)__'}</span> of the United States.
                      </p>
                      <p>
                        The capital city is <span className="inline-block min-w-[100px] border-b-2 border-turquoise/30 text-turquoise font-bold text-center px-2">{gapFillAnswers[4] || '__(4)__'}</span> on Oʻahu. People speak English, but Hawaiian is also an official <span className="inline-block min-w-[100px] border-b-2 border-turquoise/30 text-turquoise font-bold text-center px-2">{gapFillAnswers[5] || '__(5)__'}</span>.
                      </p>
                      <p>
                        Hawaiʻi is famous for beaches, surfing, and <span className="inline-block min-w-[100px] border-b-2 border-turquoise/30 text-turquoise font-bold text-center px-2">{gapFillAnswers[6] || '__(6)__'}</span>. It is also known for its culture, nature, and military <span className="inline-block min-w-[100px] border-b-2 border-turquoise/30 text-turquoise font-bold text-center px-2">{gapFillAnswers[7] || '__(7)__'}</span>.
                      </p>
                      <p>
                        During the bus ride, you see tropical plants, hills, and the <span className="inline-block min-w-[100px] border-b-2 border-turquoise/30 text-turquoise font-bold text-center px-2">{gapFillAnswers[8] || '__(8)__'}</span>. Your guide explains that Hawaiʻi has strong <span className="inline-block min-w-[100px] border-b-2 border-turquoise/30 text-turquoise font-bold text-center px-2">{gapFillAnswers[9] || '__(9)__'}</span>, with many different plants and animals.
                      </p>
                      <p>
                        Soon, you arrive at your wooden <span className="inline-block min-w-[100px] border-b-2 border-turquoise/30 text-turquoise font-bold text-center px-2">{gapFillAnswers[10] || '__(10)__'}</span> in nature.
                      </p>
                    </div>
                  </div>
                </div>

                  <div className="space-y-6">
                    <div className="journal-card p-6 space-y-6">
                      <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-display">Word Bank</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Hawaiʻi', 'islands', 'state', 'Honolulu', 'language', 
                          'volcanoes', 'history', 'ocean', 'biodiversity', 'cabin'
                        ].map(word => (
                          <button
                            key={word}
                            disabled={gapFillFeedback}
                            onClick={() => {
                              // Find first empty gap
                              const nextGap = [1,2,3,4,5,6,7,8,9,10].find(i => !gapFillAnswers[i]);
                              if (nextGap) {
                                setGapFillAnswers(prev => ({ ...prev, [nextGap]: word }));
                                setGapFillFeedback(false);
                              }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                              Object.values(gapFillAnswers).includes(word)
                                ? 'bg-sand/30 border-sand-dark text-deep-sea/20'
                                : 'bg-white border-sand-dark text-text-main hover:border-turquoise hover:text-turquoise'
                            }`}
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => {
                          setGapFillAnswers({});
                          setGapFillFeedback(false);
                        }}
                        className="text-[10px] font-bold text-coral uppercase tracking-widest hover:opacity-70 transition-opacity"
                      >
                        Reset Gaps
                      </button>
                    </div>

                    {Object.keys(gapFillAnswers).length === 10 && !gapFillFeedback && (
                      <button 
                        onClick={() => {
                          const correctAnswers: Record<number, string> = {
                            1: 'Hawaiʻi', 2: 'islands', 3: 'state', 4: 'Honolulu', 5: 'language',
                            6: 'volcanoes', 7: 'history', 8: 'ocean', 9: 'biodiversity', 10: 'cabin'
                          };
                          const allCorrect = Object.entries(correctAnswers).every(([i, word]) => gapFillAnswers[parseInt(i)] === word);
                          if (allCorrect) {
                            setGapFillFeedback(true);
                          } else {
                            // No explicit error state needed, just don't set feedback
                          }
                        }}
                        className="w-full bg-deep-sea text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                      >
                        Check Summary
                      </button>
                    )}

                    {gapFillFeedback ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="p-6 bg-turquoise/10 text-deep-sea rounded-2xl text-center border border-turquoise/20">
                          <p className="font-serif italic text-lg">Good job. You are building your Hawaii travel notes step by step.</p>
                          <p className="text-xs font-bold uppercase tracking-widest opacity-40 mt-2">Summary Complete</p>
                        </div>
                        <button 
                          onClick={() => nextScene('welcome-tour-1')}
                          className="w-full bg-turquoise text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-deep-sea transition-all shadow-xl shadow-turquoise/20"
                        >
                          Continue Journey
                        </button>
                      </motion.div>
                    ) : Object.keys(gapFillAnswers).length === 10 && (
                      <div className="p-6 bg-coral/10 text-coral rounded-2xl text-center border border-coral/20">
                        <p className="font-serif italic text-lg">Not everything is correct yet. Check your answers and try again.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'welcome-tour-1' && (
            <SceneWrapper key="welcome-tour-1">
              <TourStopIndicator current={10} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-palm/10 text-palm rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <MapPin size={12} />
                    Village Arrival
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    The Welcome Tour
                  </h2>
                  <p className="text-text-muted italic font-serif text-xl">The village begins to reveal itself.</p>
                </div>

                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0 items-stretch">
                    <div className="p-8 sm:p-12 space-y-6 text-text-main leading-relaxed text-base sm:text-lg font-serif">
                      <p>
                        You follow your guide away from the cabin and deeper into the village. The evening sky is getting darker, but soft lights shine between the buildings, trees, and small paths.
                      </p>
                      <p>
                        The air still feels warm after the long journey. Somewhere nearby, you hear music, quiet voices, and the soft sound of the ocean in the distance.
                      </p>
                      <p>
                        Your guide walks slowly, as if he wants you to notice everything.
                      </p>
                      <div className="p-6 bg-sand/50 rounded-[2rem] border border-sand-dark italic text-deep-sea relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-sand-dark">
                          <Waves size={16} className="text-turquoise" />
                        </div>
                        “This,” he says, “is your first real welcome to Hawaiʻi. Not just the airport. Not just the road. This is where you begin to feel the place.”
                      </div>
                      <p>
                        For the first time since you arrived, you stop thinking about the flight and start paying attention to what is around you.
                      </p>
                    </div>
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                      <img 
                        src={SCENE_ASSETS.scene5} 
                        alt="Village at Night" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-sea/40 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Village Life</p>
                        <p className="font-serif italic">Soft lights and warm air</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-sand-dark/30 flex justify-center">
                    <button 
                      onClick={() => nextScene('welcome-tour-2')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center gap-3"
                    >
                      Walk Further
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'welcome-tour-2' && (
            <SceneWrapper key="welcome-tour-2">
              <TourStopIndicator current={11} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-coral/10 text-coral rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <BookOpen size={12} />
                    Observation
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    Looking More Carefully
                  </h2>
                  <p className="text-text-muted italic font-serif text-xl">Small details tell a bigger story.</p>
                </div>

                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0 items-stretch">
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px] order-2 md:order-1">
                      <img 
                        src={SCENE_ASSETS.scene6} 
                        alt="Village Details" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-sea/40 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Local Details</p>
                        <p className="font-serif italic">Flowers and Hawaiian names</p>
                      </div>
                    </div>
                    <div className="p-8 sm:p-12 space-y-6 text-text-main leading-relaxed text-base sm:text-lg font-serif order-1 md:order-2">
                      <p>
                        As you walk further, you begin to notice more small details.
                      </p>
                      <p>
                        Some people are sitting outside together and talking. A family is carrying bags from a small shop. You see flowers near doors and windows. A few signs have Hawaiian names on them.
                      </p>
                      <p>
                        Nothing feels rushed. The village is quiet, but it does not feel empty. It feels lived in.
                      </p>
                      <div className="p-6 bg-sand/50 rounded-[2rem] border border-sand-dark italic text-deep-sea relative">
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-sand-dark">
                          <Sun size={16} className="text-coral" />
                        </div>
                        “You see?” the guide asks. “The islands are not just for visitors. They are home to many people.”
                      </div>
                      <p>
                        You look again. The lights, the sounds, the people, the plants — everything seems connected.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-sand-dark/30 flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={() => setCurrentScene('welcome-tour-1')}
                      className="px-10 py-5 rounded-full font-display font-bold text-xs uppercase tracking-widest text-text-muted hover:bg-sand-dark/50 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Go Back
                    </button>
                    <button 
                      onClick={() => nextScene('welcome-tour-3')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center justify-center gap-3"
                    >
                      Continue Walking
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'welcome-tour-3' && (
            <SceneWrapper key="welcome-tour-3">
              <TourStopIndicator current={12} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-turquoise/10 text-turquoise rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <BookOpen size={12} />
                    Deeper Meaning
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    More Than a Holiday Place
                  </h2>
                  <p className="text-palm/60 italic font-serif text-xl">Beyond the beaches and hotels.</p>
                </div>

                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0 items-stretch">
                    <div className="p-8 sm:p-12 space-y-6 text-deep-sea/80 leading-relaxed text-base sm:text-lg font-serif">
                      <p>
                        Your guide stops for a moment and points around the village.
                      </p>
                      <div className="p-6 bg-sand/50 rounded-[2rem] border border-sand-dark italic text-deep-sea/90 relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-sand-dark">
                          <Compass size={16} className="text-palm" />
                        </div>
                        “Many visitors think Hawaiʻi is only about holidays,” he says. “They think about beaches, hotels, and surfing first.”
                      </div>
                      <p>
                        He pauses for a moment.
                      </p>
                      <p className="font-serif text-lg text-deep-sea italic">
                        “And yes, those things are part of Hawaiʻi too. But this place is more than that.”
                      </p>
                      <p>
                        He points toward the houses, the small shops, and the people talking outside.
                      </p>
                      <p className="font-serif text-lg text-deep-sea italic">
                        “Hawaiʻi is also daily life. It is family, language, traditions, music, food, and memory.”
                      </p>
                      <p>
                        You listen more carefully now. It feels less like a tourist trip and more like the beginning of a story.
                      </p>
                    </div>
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                      <img 
                        src={SCENE_ASSETS.scene7} 
                        alt="Daily Life" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-sea/40 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Island Life</p>
                        <p className="font-serif italic">Beyond the surface</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-sand-dark/30 flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={() => setCurrentScene('welcome-tour-2')}
                      className="px-10 py-5 rounded-full font-display font-bold text-xs uppercase tracking-widest text-deep-sea/60 hover:bg-sand-dark/50 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Go Back
                    </button>
                    <button 
                      onClick={() => nextScene('welcome-tour-4')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center justify-center gap-3"
                    >
                      Explore Further
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'welcome-tour-4' && (
            <SceneWrapper key="welcome-tour-4">
              <TourStopIndicator current={13} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-palm/10 text-palm rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <Waves size={12} />
                    Cultural Awareness
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    Culture Around You
                  </h2>
                  <p className="text-text-muted italic font-serif text-xl">Tradition in every step.</p>
                </div>

                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0 items-stretch">
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px] order-2 md:order-1">
                      <img 
                        src={SCENE_ASSETS.scene8} 
                        alt="Culture in Everyday Life" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-sea/40 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Living History</p>
                        <p className="font-serif italic">Everyday traditions</p>
                      </div>
                    </div>
                    <div className="p-8 sm:p-12 space-y-6 text-text-main leading-relaxed text-base sm:text-lg font-serif order-1 md:order-2">
                      <p>
                        As the tour continues, your guide points out small things you might not notice at first.
                      </p>
                      <p>
                        He shows you flowers used in local traditions. He points at names written in Hawaiian. He explains that culture is not only in museums or old buildings. It is also in everyday life.
                      </p>
                      <div className="p-6 bg-sand/50 rounded-[2rem] border border-sand-dark italic text-deep-sea relative">
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-sand-dark">
                          <BookOpen size={16} className="text-turquoise" />
                        </div>
                        “It is in the words people use,” he says. “It is in how they greet each other. It is in what they respect.”
                      </div>
                      <p>
                        You begin to understand what he means. The village is not trying to impress you. It is simply showing you what life here feels like.
                      </p>
                      <p>
                        And somehow, that makes it even more interesting.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-sand-dark/30 flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={() => setCurrentScene('welcome-tour-3')}
                      className="px-10 py-5 rounded-full font-display font-bold text-xs uppercase tracking-widest text-text-muted hover:bg-sand-dark/50 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Go Back
                    </button>
                    <button 
                      onClick={() => nextScene('welcome-tour-5')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center justify-center gap-3"
                    >
                      Listen Closer
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'welcome-tour-5' && (
            <SceneWrapper key="welcome-tour-5">
              <TourStopIndicator current={14} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-turquoise/10 text-turquoise rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <BookOpen size={12} />
                    Final Reflection
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    A Place That Speaks Softly
                  </h2>
                  <p className="text-palm/60 italic font-serif text-xl">Understanding the rhythm of the island.</p>
                </div>

                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0 items-stretch">
                    <div className="p-8 sm:p-12 space-y-6 text-deep-sea/80 leading-relaxed text-base sm:text-lg font-serif">
                      <p>
                        The guide continues walking, and you follow him through the warm evening air.
                      </p>
                      <p>
                        You hear music again. You see more families, more lights, more signs, more plants. Everything feels calm, but full of meaning.
                      </p>
                      <div className="p-6 bg-sand/50 rounded-[2rem] border border-sand-dark italic text-deep-sea/90 relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-sand-dark">
                          <Waves size={16} className="text-turquoise" />
                        </div>
                        “A place is not only something you visit,” your guide says. “You have to look, listen, and notice how people live.”
                      </div>
                      <p>
                        You think about that while you walk. At first, the village looked simple.
                      </p>
                      <p>
                        Now it feels different — as if it is speaking softly, and you are only just starting to understand it.
                      </p>
                    </div>
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                      <img 
                        src={SCENE_ASSETS.scene9} 
                        alt="Soft Evening" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-sea/40 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Evening Calm</p>
                        <p className="font-serif italic">The rhythm of the island</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-sand-dark/30 flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={() => setCurrentScene('welcome-tour-4')}
                      className="px-10 py-5 rounded-full font-display font-bold text-xs uppercase tracking-widest text-deep-sea/60 hover:bg-sand-dark/50 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Go Back
                    </button>
                    <button 
                      onClick={() => nextScene('village-clues')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center justify-center gap-3"
                    >
                      Start Village Tasks
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'village-clues' && (
            <SceneWrapper key="village-clues">
              <TourStopIndicator current={15} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-3xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-turquoise/10 text-turquoise rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <BookOpen size={12} />
                    Observation Skills
                  </div>
                  <h2 className="text-4xl font-serif text-deep-sea">Village Clues</h2>
                  <p className="text-text-muted italic font-serif text-xl">Choose the things that fit the village welcome tour.</p>
                  <StoryRecallButton onOpen={() => setIsStoryNavigatorOpen(true)} />
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-8">
                  <div className="space-y-8">
                    <p className="text-center font-serif italic text-2xl text-black">Which things do you notice during the walk?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        'music', 'local shops', 'flowers', 'ocean sounds', 
                        'snow', 'heavy traffic', 'Hawaiian names', 'families outside'
                      ].map(option => {
                        const isSelected = villageCluesAnswers.includes(option);
                        return (
                          <button
                            key={option}
                            onClick={() => {
                              if (isSelected) {
                                setVillageCluesAnswers(prev => prev.filter(a => a !== option));
                              } else {
                                setVillageCluesAnswers(prev => [...prev, option]);
                              }
                              setVillageCluesAttempted(false);
                            }}
                            className={`p-5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all border text-center ${
                              isSelected
                                ? 'bg-turquoise border-turquoise text-white shadow-lg shadow-turquoise/20'
                                : 'bg-white border-sand-dark text-black hover:border-turquoise hover:text-turquoise'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col items-center gap-6">
                    <button 
                      onClick={() => {
                        const correct = ['music', 'local shops', 'flowers', 'ocean sounds', 'Hawaiian names', 'families outside'];
                        const isCorrect = villageCluesAnswers.length === correct.length && 
                                        villageCluesAnswers.every(a => correct.includes(a));
                        
                        if (isCorrect) {
                          setVillageCluesFeedback(true);
                        } else {
                          setVillageCluesAttempted(true);
                        }
                      }}
                      className="w-full bg-deep-sea text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                    >
                      Check Clues
                    </button>

                    {villageCluesAttempted && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-coral font-bold uppercase tracking-widest font-display"
                      >
                        Not everything fits the village. Check your answers and try again.
                      </motion.p>
                    )}

                    {villageCluesFeedback && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full space-y-6"
                      >
                        <div className="p-6 bg-turquoise/10 text-deep-sea rounded-2xl text-center border border-turquoise/20">
                          <p className="font-serif italic text-lg">Good job. You are noticing the village more carefully now.</p>
                        </div>
                        <button 
                          onClick={() => nextScene('sort-clues')}
                          className="w-full bg-turquoise text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-deep-sea transition-all shadow-xl shadow-turquoise/20"
                        >
                          Next Task
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'sort-clues' && (
            <SceneWrapper key="sort-clues">
              <TourStopIndicator current={16} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-5xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-palm/10 text-palm rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display mb-2">
                    <BookOpen size={12} />
                    Classification
                  </div>
                  <h2 className="text-4xl font-serif text-deep-sea">Sort the Clues</h2>
                  <p className="text-text-muted italic font-serif text-xl">Put the clues in the correct group.</p>
                  <StoryRecallButton onOpen={() => setIsStoryNavigatorOpen(true)} />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {['Culture', 'Nature', 'Daily life'].map(category => (
                    <div key={category} className="journal-card p-6 space-y-6 min-h-[250px] flex flex-col">
                      <h3 className="text-xl font-serif text-center text-deep-sea border-b border-sand-dark pb-4">{category}</h3>
                      <div className="flex-grow space-y-3">
                        {Object.entries(sortCluesAnswers)
                          .filter(([_, cat]) => cat === category)
                          .map(([item]) => (
                            <motion.div 
                              layoutId={`item-${item}`}
                              key={item} 
                              className="p-4 bg-turquoise/10 text-text-main rounded-2xl text-sm font-bold uppercase tracking-widest text-center border border-turquoise/20"
                            >
                              {item}
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-8">
                  <div className="flex flex-wrap justify-center gap-3">
                    {['lei', 'ocean', 'small shop', 'music', 'trees', 'family'].map(item => (
                      <button
                        key={item}
                        disabled={sortCluesFeedback}
                        onClick={() => {
                          const categories = ['Culture', 'Nature', 'Daily life'];
                          const currentCat = sortCluesAnswers[item];
                          const nextCatIndex = currentCat ? (categories.indexOf(currentCat) + 1) % categories.length : 0;
                          setSortCluesAnswers(prev => ({ ...prev, [item]: categories[nextCatIndex] }));
                        }}
                        className={`px-6 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest ${
                          sortCluesAnswers[item] 
                            ? 'bg-deep-sea border-deep-sea text-white shadow-lg shadow-deep-sea/20' 
                            : 'bg-white border-sand-dark text-black hover:border-turquoise hover:text-turquoise'
                        }`}
                      >
                        {item} {sortCluesAnswers[item] ? `→ ${sortCluesAnswers[item]}` : ''}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-6">
                    <button 
                      onClick={() => {
                        const correct: Record<string, string> = {
                          'lei': 'Culture', 'music': 'Culture',
                          'ocean': 'Nature', 'trees': 'Nature',
                          'small shop': 'Daily life', 'family': 'Daily life'
                        };
                        const isCorrect = Object.keys(correct).every(item => sortCluesAnswers[item] === correct[item]);
                        if (isCorrect) {
                          setSortCluesFeedback(true);
                        }
                      }}
                      className="w-full bg-deep-sea text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                    >
                      Check Sorting
                    </button>

                    {sortCluesFeedback ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full space-y-6"
                      >
                        <div className="p-6 bg-turquoise/10 text-deep-sea rounded-2xl text-center border border-turquoise/20">
                          <p className="font-serif italic text-lg">Well done. Hawaiʻi is a mix of culture, nature, and daily life.</p>
                        </div>
                        <button 
                          onClick={() => nextScene('tour-notebook')}
                          className="w-full bg-turquoise text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-deep-sea transition-all shadow-xl shadow-turquoise/20"
                        >
                          Next Task
                        </button>
                      </motion.div>
                    ) : Object.keys(sortCluesAnswers).length === 6 && (
                      <p className="text-sm text-coral font-bold uppercase tracking-widest font-display">Some clues are still in the wrong group. Try again.</p>
                    )}
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'tour-notebook' && (
            <SceneWrapper key="tour-notebook">
              <TourStopIndicator current={17} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-serif text-deep-sea">Tour Notebook</h2>
                  <p className="text-text-muted italic font-serif text-xl">Write down 3 things you noticed during the welcome tour.</p>
                  <StoryRecallButton onOpen={() => setIsStoryNavigatorOpen(true)} />
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest font-display">One culture clue I noticed:</label>
                      <input 
                        type="text"
                        placeholder="for example: music, Hawaiian names"
                        value={notebookNotes.culture}
                        onChange={(e) => setNotebookNotes(prev => ({ ...prev, culture: e.target.value }))}
                        className="w-full p-4 bg-sand/30 border border-sand-dark rounded-2xl focus:ring-2 focus:ring-turquoise focus:border-transparent outline-none transition-all text-text-main placeholder:text-text-muted/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest font-display">One nature clue I noticed:</label>
                      <input 
                        type="text"
                        placeholder="for example: flowers, ocean"
                        value={notebookNotes.nature}
                        onChange={(e) => setNotebookNotes(prev => ({ ...prev, nature: e.target.value }))}
                        className="w-full p-4 bg-sand/30 border border-sand-dark rounded-2xl focus:ring-2 focus:ring-turquoise focus:border-transparent outline-none transition-all text-text-main placeholder:text-text-muted/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest font-display">One daily life clue I noticed:</label>
                      <input 
                        type="text"
                        placeholder="for example: shops, families"
                        value={notebookNotes.dailyLife}
                        onChange={(e) => setNotebookNotes(prev => ({ ...prev, dailyLife: e.target.value }))}
                        className="w-full p-4 bg-sand/30 border border-sand-dark rounded-2xl focus:ring-2 focus:ring-turquoise focus:border-transparent outline-none transition-all text-text-main placeholder:text-text-muted/40"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col items-center gap-4">
                    <button 
                      disabled={!notebookNotes.culture || !notebookNotes.nature || !notebookNotes.dailyLife}
                      onClick={() => setNotebookFeedback(true)}
                      className="w-full bg-deep-sea text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save to Notebook
                    </button>

                    {notebookFeedback && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-4"
                      >
                        <div className="p-6 bg-turquoise/10 text-deep-sea rounded-2xl text-center border border-turquoise/20">
                          <p className="font-serif italic text-lg">Good. You are starting to see more than just the surface.</p>
                        </div>
                        <button 
                          onClick={() => nextScene('scenic-route-1')}
                          className="w-full bg-turquoise text-white py-5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-deep-sea transition-all shadow-xl shadow-turquoise/20"
                        >
                          Continue Journey
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'scenic-route-1' && (
            <SceneWrapper key="scenic-route-1">
              <TourStopIndicator current={18} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    The Route Continues
                  </h2>
                  <p className="text-text-muted italic font-serif text-xl">Leaving the quiet village behind.</p>
                </div>

                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="p-8 sm:p-12 space-y-6 text-text-main leading-relaxed text-base sm:text-lg font-serif">
                      <p>
                        You continue walking with your guide, leaving the quiet village behind. The path opens up to wider views, and the evening feels deeper now.
                      </p>
                      <p>
                        The guide slows down and looks around.
                      </p>
                      <p className="font-serif text-lg text-deep-sea italic">
                        “Hawaiʻi is beautiful,” he says, “but beauty is not the whole story.”
                      </p>
                      <p>
                        You follow the route and begin to understand that this part of the journey is different. It is not only about what you see. It is also about what happened here, what changed here, and what people still remember.
                      </p>
                    </div>
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                      <img 
                        src={SCENE_ASSETS.scene10} 
                        alt="Scenic Route" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  
                  <div className="p-8 bg-sand-dark/30 flex justify-center">
                    <button 
                      onClick={() => nextScene('scenic-route-2')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center gap-3"
                    >
                      Walk On
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'scenic-route-2' && (
            <SceneWrapper key="scenic-route-2">
              <TourStopIndicator current={19} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    A King and the Islands
                  </h2>
                  <p className="text-text-muted italic font-serif text-xl">A story of identity and leadership.</p>
                </div>

                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0 items-stretch">
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px] order-2 md:order-1">
                      <img 
                        src={SCENE_ASSETS.scene12} 
                        alt="King Kamehameha" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-8 sm:p-12 space-y-6 text-text-main leading-relaxed text-base sm:text-lg font-serif order-1 md:order-2">
                      <p>
                        As the route continues, your guide tells you about <strong>King Kamehameha</strong>.
                      </p>
                      <p>
                        He explains that long ago, the Hawaiian Islands were not united in the same way they are now. King Kamehameha brought the islands together, and this changed Hawaiʻi in an important way.
                      </p>
                      <p className="font-serif text-lg text-deep-sea italic">
                        “That is why he is still remembered,” your guide says. “He is part of the story of identity, leadership, and change.”
                      </p>
                      <p>
                        You look out at the landscape and try to imagine how different Hawaiʻi must have looked in the past.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-sand-dark/30 flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={() => setCurrentScene('scenic-route-1')}
                      className="px-10 py-5 rounded-full font-display font-bold text-xs uppercase tracking-widest text-text-muted hover:bg-sand-dark/50 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Go Back
                    </button>
                    <button 
                      onClick={() => nextScene('scenic-route-3')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center justify-center gap-3"
                    >
                      Continue the Story
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'scenic-route-3' && (
            <SceneWrapper key="scenic-route-3">
              <TourStopIndicator current={20} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    Change from Outside
                  </h2>
                  <p className="text-text-muted italic font-serif text-xl">Where cultures and histories meet.</p>
                </div>

                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0 items-stretch">
                    <div className="p-8 sm:p-12 space-y-6 text-text-main leading-relaxed text-base sm:text-lg font-serif">
                      <p>
                        The guide keeps walking and points out that Hawaiʻi changed again over time.
                      </p>
                      <p>
                        People from other countries became part of life in Hawaiʻi. Japanese influence grew, and American influence became stronger too.
                      </p>
                      <p>
                        He explains that Hawaiʻi is a place where cultures, people, and histories met each other. Some changes brought new ideas and new communities.
                      </p>
                      <p className="font-serif text-lg text-deep-sea italic">
                        “This is why Hawaiʻi is more than a holiday place,” he says. “It is also a place of history.”
                      </p>
                    </div>
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                      <img 
                        src={SCENE_ASSETS.scene12} 
                        alt="Cultural Influence" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  
                  <div className="p-8 bg-sand-dark/30 flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={() => setCurrentScene('scenic-route-2')}
                      className="px-10 py-5 rounded-full font-display font-bold text-xs uppercase tracking-widest text-text-muted hover:bg-sand-dark/50 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Go Back
                    </button>
                    <button 
                      onClick={() => nextScene('scenic-route-4')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center justify-center gap-3"
                    >
                      Listen Further
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'scenic-route-4' && (
            <SceneWrapper key="scenic-route-4">
              <TourStopIndicator current={21} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    A Place with Memory
                  </h2>
                  <p className="text-text-muted italic font-serif text-xl">Layers of story beneath the surface.</p>
                </div>

                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0 items-stretch">
                    <div className="p-8 sm:p-12 space-y-6 text-text-main leading-relaxed text-lg text-center flex flex-col justify-center font-serif">
                      <p>
                        The route becomes quieter again.
                      </p>
                      <p>
                        You think about everything the guide has told you so far. Hawaiʻi is not only beaches, volcanoes, and surfing. It is also language, culture, leadership, outside influence, and memory.
                      </p>
                      <p className="font-serif text-2xl text-deep-sea italic">
                        “Some places are beautiful because they look impressive. Other places are important because they carry stories.”
                      </p>
                    </div>
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                      <img 
                        src={SCENE_ASSETS.scene11} 
                        alt="Historical Reflection" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  
                  <div className="p-8 bg-sand-dark/30 flex justify-center gap-4">
                    <button 
                      onClick={() => setCurrentScene('scenic-route-3')}
                      className="px-10 py-5 rounded-full font-display font-bold text-xs uppercase tracking-widest text-text-muted hover:bg-sand-dark/50 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Go Back
                    </button>
                    <button 
                      onClick={() => nextScene('sort-facts')}
                      className="group bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center justify-center gap-3"
                    >
                      Start Route Tasks
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'sort-facts' && (
            <SceneWrapper key="sort-facts">
              <TourStopIndicator current={22} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-5xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl sm:text-5xl font-serif font-medium text-deep-sea">Sort the Facts</h2>
                  <p className="text-text-muted italic font-serif text-xl">Place the facts in the correct category.</p>
                  <StoryRecallButton onOpen={() => setIsStoryNavigatorOpen(true)} />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {['Traditional Hawaii', 'Historical Change', 'Outside Influence'].map(category => (
                    <div key={category} className="journal-card p-6 space-y-4 min-h-[250px] flex flex-col">
                      <h3 className="text-lg font-serif font-bold text-center border-b border-sand-dark pb-2 text-deep-sea">{category}</h3>
                      <div className="flex flex-wrap gap-2 justify-center py-4">
                        {Object.entries(sortFactsAnswers)
                          .filter(([_, cat]) => cat === category)
                          .map(([item]) => (
                            <div key={item} className="px-3 py-1.5 bg-turquoise/10 text-turquoise rounded-xl text-xs font-bold border border-turquoise/20">
                              {item}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-8">
                  <div className="flex flex-wrap justify-center gap-2">
                        {[
                          'aloha', 'hula', 'lei', 'Hawaiian language', 'ʻohana',
                          'King Kamehameha', 'united the islands', 'monarchy', 'change over time', '50th state',
                          'Japan', 'America', 'military history', 'Union Jack on the flag', 'contact with other countries'
                        ].map(item => (
                          <button
                            key={item}
                            disabled={sortFactsFeedback}
                            onClick={() => {
                              const categories = ['Traditional Hawaii', 'Historical Change', 'Outside Influence'];
                              const currentCat = sortFactsAnswers[item];
                              const nextCatIndex = currentCat ? (categories.indexOf(currentCat) + 1) : 0;
                              if (nextCatIndex < categories.length) {
                                setSortFactsAnswers(prev => ({ ...prev, [item]: categories[nextCatIndex] }));
                              } else {
                                const newAnswers = { ...sortFactsAnswers };
                                delete newAnswers[item];
                                setSortFactsAnswers(newAnswers);
                              }
                              setSortFactsAttempted(false);
                            }}
                            className={`px-4 py-2 rounded-xl border transition-all text-sm font-bold uppercase tracking-wider font-display ${
                              sortFactsAnswers[item] 
                                ? 'bg-deep-sea border-deep-sea text-white' 
                                : 'bg-sand border-sand-dark text-black hover:border-turquoise'
                            }`}
                          >
                            {item} {sortFactsAnswers[item] ? `(${sortFactsAnswers[item]})` : ''}
                          </button>
                        ))}
                  </div>

                  <div className="flex flex-col items-center gap-6 pt-4 border-t border-sand-dark/50">
                    <button 
                      onClick={() => {
                        const correct: Record<string, string> = {
                          'aloha': 'Traditional Hawaii', 'hula': 'Traditional Hawaii', 'lei': 'Traditional Hawaii', 'Hawaiian language': 'Traditional Hawaii', 'ʻohana': 'Traditional Hawaii',
                          'King Kamehameha': 'Historical Change', 'united the islands': 'Historical Change', 'monarchy': 'Historical Change', 'change over time': 'Historical Change', '50th state': 'Historical Change',
                          'Japan': 'Outside Influence', 'America': 'Outside Influence', 'military history': 'Outside Influence', 'Union Jack on the flag': 'Outside Influence', 'contact with other countries': 'Outside Influence'
                        };
                        const correctCount = Object.keys(correct).filter(item => sortFactsAnswers[item] === correct[item]).length;
                        
                        if (correctCount >= 10) {
                          setSortFactsFeedback(true);
                        } else {
                          setSortFactsAttempted(true);
                        }
                      }}
                      className="bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                    >
                      Check Sorting
                    </button>

                    {sortFactsAttempted && (
                      <p className="text-sm text-coral font-bold font-display uppercase tracking-wider">You need at least 10 correct answers to continue. Check the facts and try again.</p>
                    )}

                    {sortFactsFeedback && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-4"
                      >
                        <div className="p-6 bg-palm/10 text-palm rounded-[2rem] text-center border border-palm/20">
                          <p className="font-serif italic text-lg">Good job. You already understand many of Hawaii’s key ideas.</p>
                        </div>
                        <button 
                          onClick={() => nextScene('true-false-check')}
                          className="w-full bg-turquoise text-white py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-deep-sea transition-all shadow-xl shadow-turquoise/20"
                        >
                          Next Task
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'true-false-check' && (
            <SceneWrapper key="true-false-check">
              <TourStopIndicator current={23} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-2xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl sm:text-5xl font-serif font-medium text-deep-sea">Which Statement Is True?</h2>
                  <p className="text-text-muted italic font-serif text-xl">Choose the true statement.</p>
                  <StoryRecallButton onOpen={() => setIsStoryNavigatorOpen(true)} />
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-8">
                  <div className="flex justify-center gap-3">
                    {[0, 1, 2].map((i) => (
                      <div 
                        key={i} 
                        className={`h-2 rounded-full transition-all duration-500 ${i === trueFalseStep ? 'w-12 bg-turquoise' : 'w-3 bg-sand-dark'}`}
                      />
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={trueFalseStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          [
                            { text: 'King Kamehameha united the islands.', correct: true },
                            { text: 'Hawaiʻi has no important history.', correct: false },
                            { text: 'Hawaiʻi never changed over time.', correct: false }
                          ],
                          [
                            { text: 'Hawaiʻi was influenced by other countries.', correct: true },
                            { text: 'Only tourists ever changed Hawaiʻi.', correct: false },
                            { text: 'Hawaiian culture disappeared completely.', correct: false }
                          ],
                          [
                            { text: 'Hawaiʻi is only famous for beaches.', correct: false },
                            { text: 'Hawaiʻi also has history, culture, and memory.', correct: true },
                            { text: 'Hawaiʻi has no traditions today.', correct: false }
                          ]
                        ][trueFalseStep].map((option, idx) => (
                          <button
                            key={idx}
                            disabled={trueFalseFeedback !== null}
                            onClick={() => {
                              setTrueFalseCorrect(option.correct);
                              setTrueFalseFeedback(option.correct ? 'Correct!' : 'Try again.');
                            }}
                            className={`p-6 text-left border-2 rounded-[2rem] transition-all text-base sm:text-lg font-serif ${
                              trueFalseFeedback && option.correct ? 'bg-palm/10 border-palm/30 text-palm' :
                              trueFalseFeedback && !option.correct && trueFalseCorrect === false ? 'bg-coral/10 border-coral/30 text-coral' :
                              'bg-sand/30 border-sand-dark hover:border-turquoise hover:bg-white'
                            }`}
                          >
                            {option.text}
                          </button>
                        ))}
                      </div>

                      {trueFalseFeedback && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center space-y-6 pt-4"
                        >
                          {trueFalseCorrect ? (
                            <button 
                              onClick={() => {
                                if (trueFalseStep < 2) {
                                  setTrueFalseStep(trueFalseStep + 1);
                                  setTrueFalseFeedback(null);
                                  setTrueFalseCorrect(null);
                                } else {
                                  nextScene('timeline-check');
                                }
                              }}
                              className="bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                            >
                              {trueFalseStep < 2 ? 'Next Question' : 'Continue to Timeline'}
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                setTrueFalseFeedback(null);
                                setTrueFalseCorrect(null);
                              }}
                              className="text-turquoise font-bold font-display uppercase tracking-widest hover:underline"
                            >
                              Try Again
                            </button>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'timeline-check' && (
            <SceneWrapper key="timeline-check">
              <TourStopIndicator current={24} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-2xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl sm:text-5xl font-serif font-medium text-deep-sea">Timeline Check</h2>
                  <p className="text-text-muted italic font-serif text-xl">Put these moments in the correct order.</p>
                  <StoryRecallButton onOpen={() => setIsStoryNavigatorOpen(true)} />
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-8">
                  <div className="space-y-4">
                    {timelineOrder.map((item, idx) => (
                      <div key={item} className="flex items-center gap-4 p-5 bg-turquoise/10 border border-turquoise/20 rounded-[2rem]">
                        <div className="w-10 h-10 bg-turquoise text-white rounded-full flex items-center justify-center font-display font-bold text-sm shadow-lg shadow-turquoise/20">
                          {idx + 1}
                        </div>
                        <p className="text-base font-serif font-medium text-deep-sea">{item}</p>
                        <button 
                          onClick={() => setTimelineOrder(prev => prev.filter(i => i !== item))}
                          className="ml-auto p-2 text-turquoise hover:bg-white rounded-full transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                    {timelineOrder.length < 4 && (
                      <div className="grid grid-cols-1 gap-3 mt-6">
                        {[
                          'King Kamehameha united the islands',
                          'Japanese influence grew',
                          'American influence became stronger',
                          'Hawaiʻi became the 50th state'
                        ].filter(item => !timelineOrder.includes(item)).map(item => (
                          <button
                            key={item}
                            onClick={() => {
                              setTimelineOrder(prev => [...prev, item]);
                              setTimelineAttempted(false);
                            }}
                            className="p-5 text-left bg-sand/30 border-2 border-sand-dark rounded-[2rem] hover:border-turquoise hover:bg-white transition-all text-base font-serif font-medium text-text-main"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 flex flex-col items-center gap-6 border-t border-sand-dark/50">
                    {timelineOrder.length === 4 && !timelineFeedback && (
                      <button 
                        onClick={() => {
                          const correct = [
                            'King Kamehameha united the islands',
                            'Japanese influence grew',
                            'American influence became stronger',
                            'Hawaiʻi became the 50th state'
                          ];
                          const isCorrect = timelineOrder.every((item, idx) => item === correct[idx]);
                          if (isCorrect) {
                            setTimelineFeedback(true);
                          } else {
                            setTimelineAttempted(true);
                          }
                        }}
                        className="bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                      >
                        Check Timeline
                      </button>
                    )}

                    {timelineAttempted && (
                      <p className="text-sm text-coral font-bold font-display uppercase tracking-wider">The timeline is not correct yet. Try again.</p>
                    )}

                    {timelineFeedback && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-4"
                      >
                        <div className="p-6 bg-palm/10 text-palm rounded-[2rem] text-center border border-palm/20">
                          <p className="font-serif italic text-lg">Well done. You can now see that Hawaii changed over time.</p>
                        </div>
                        <button 
                          onClick={() => nextScene('reflection-task')}
                          className="w-full bg-turquoise text-white py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-deep-sea transition-all shadow-xl shadow-turquoise/20"
                        >
                          Next Task
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'reflection-task' && (
            <SceneWrapper key="reflection-task">
              <TourStopIndicator current={25} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-2xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl sm:text-5xl font-serif font-medium text-deep-sea">Your Reflection</h2>
                  <p className="text-text-muted italic font-serif text-xl">Answer these questions in English.</p>
                  <StoryRecallButton onOpen={() => setIsStoryNavigatorOpen(true)} />
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-display">Why is Hawaiʻi more than a holiday place?</label>
                      <textarea 
                        value={reflectionAnswers.q1}
                        onChange={(e) => setReflectionAnswers({...reflectionAnswers, q1: e.target.value})}
                        onPaste={(e) => e.preventDefault()}
                        placeholder="Write at least one full sentence."
                        className="w-full p-6 bg-sand/30 border-2 border-sand-dark rounded-[2rem] focus:ring-2 focus:ring-turquoise outline-none min-h-[120px] resize-none font-serif text-lg text-text-main"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-display">Which part of Hawaii’s history surprised you most?</label>
                      <textarea 
                        value={reflectionAnswers.q2}
                        onChange={(e) => setReflectionAnswers({...reflectionAnswers, q2: e.target.value})}
                        onPaste={(e) => e.preventDefault()}
                        placeholder="Write at least one full sentence."
                        className="w-full p-6 bg-sand/30 border-2 border-sand-dark rounded-[2rem] focus:ring-2 focus:ring-turquoise outline-none min-h-[120px] resize-none font-serif text-lg text-text-main"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-display">Why is it important to learn about change, not only about beaches and tourism?</label>
                      <textarea 
                        value={reflectionAnswers.q3}
                        onChange={(e) => setReflectionAnswers({...reflectionAnswers, q3: e.target.value})}
                        onPaste={(e) => e.preventDefault()}
                        placeholder="Write at least one full sentence."
                        className="w-full p-6 bg-sand/30 border-2 border-sand-dark rounded-[2rem] focus:ring-2 focus:ring-turquoise outline-none min-h-[120px] resize-none font-serif text-lg text-text-main"
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-sand-dark/50">
                    {!reflectionSubmitted ? (
                      <button 
                        onClick={() => setReflectionSubmitted(true)}
                        disabled={!reflectionAnswers.q1.trim() || !reflectionAnswers.q2.trim() || !reflectionAnswers.q3.trim()}
                        className="w-full bg-deep-sea text-white py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 disabled:opacity-50"
                      >
                        Submit Reflection
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="p-6 bg-palm/10 text-palm rounded-[2rem] text-center border border-palm/20">
                          <p className="font-serif italic text-lg">Good. You are not only learning facts — you are thinking about what they mean.</p>
                        </div>
                        <button 
                          onClick={() => nextScene('village-woman-1')}
                          className="w-full bg-turquoise text-white py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-deep-sea transition-all shadow-xl shadow-turquoise/20"
                        >
                          Continue Journey
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'village-woman-1' && (
            <SceneWrapper key="village-woman-1">
              <TourStopIndicator current={26} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium leading-[1.1] text-deep-sea">
                    The Quiet Moment
                  </h2>
                  <p className="text-text-muted italic font-serif text-xl">Sometimes, the most important things happen in silence.</p>
                </div>

                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0 items-stretch">
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                      <img 
                        src="https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene14.png" 
                        alt="The Quiet Woman" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-8 sm:p-12 space-y-6 text-text-main leading-relaxed text-base sm:text-lg font-serif">
                      <p>
                        The tour continues. Other visitors are busy taking photos and following the guide.
                      </p>
                      <p>
                        Then you notice an older woman near the path. She drops a small object. It falls quietly, and almost nobody sees it.
                      </p>
                      <p>
                        The guide keeps walking. The others do not stop.
                      </p>
                      <p className="font-bold text-deep-sea">
                        But you notice.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-sand-dark/30 space-y-8">
                    <div className="space-y-2 text-center">
                      <p className="text-[10px] font-bold text-turquoise uppercase tracking-[0.2em] font-display">Your Choice</p>
                      <h3 className="text-2xl font-serif text-deep-sea">What do you do?</h3>
                    </div>

                    {!villageWomanAnswered ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {[
                          'I help her.',
                          'I keep walking.',
                          'I wait for someone else.',
                          'I take a photo.'
                        ].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setVillageWomanAnswered(true);
                              setVillageWomanChoice(option);
                            }}
                            className="p-6 text-left bg-white border-2 border-sand-dark rounded-[2rem] hover:border-turquoise transition-all text-base font-serif font-medium text-text-main shadow-sm"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                      >
                        <div className="p-6 bg-palm/10 text-palm rounded-[2rem] border border-palm/20 max-w-lg mx-auto">
                          <p className="font-serif italic text-lg">“You stop and help her. You noticed something that others missed.”</p>
                        </div>
                        <button 
                          onClick={() => nextScene('village-woman-2')}
                          className="bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                        >
                          Talk to her
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'village-woman-2' && (
            <SceneWrapper key="village-woman-2">
              <TourStopIndicator current={27} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="text-center space-y-10 max-w-2xl mx-auto">
                <div className="journal-card p-2 sm:p-3 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0 items-stretch">
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                      <img 
                        src="https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/scene15.png" 
                        alt="The Handing of the Talisman" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-sea/40 to-transparent" />
                    </div>
                    <div className="p-8 sm:p-12 space-y-6 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-coral/10 text-coral rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display w-fit">
                        The Gift
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-serif font-medium text-deep-sea">A Mysterious Gift</h2>
                      <div className="space-y-4 text-text-main leading-relaxed text-lg font-serif">
                        <p>
                          You pick up the object and give it back to the woman. She looks at you for a moment and smiles.
                        </p>
                        <p className="font-serif text-xl text-deep-sea italic border-l-4 border-coral pl-4">
                          “Mahalo,” she says softly. “Many people look, but they do not really see.”
                        </p>
                        <p>
                          Then she places a small talisman in your hand. Before you can ask anything, she slowly turns and disappears into the evening crowd.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => nextScene('meet-guide')}
                  className="bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                >
                  Catch up with the tour
                </button>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'meet-guide' && (
            <SceneWrapper key="meet-guide">
              <TourStopIndicator current={28} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="text-center space-y-10 max-w-2xl mx-auto">
                <div className="relative inline-block">
                  <div className="w-40 h-40 bg-sand rounded-full overflow-hidden mx-auto mb-4 border-4 border-white shadow-2xl relative">
                    <img 
                      src={SCENE_ASSETS.scene13} 
                      alt="The Deepening Evening" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 border-4 border-sand-dark/20 rounded-full pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-turquoise/10 text-turquoise rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display">
                    Something has changed
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-serif font-medium text-deep-sea">The evening deepens</h2>
                  <p className="text-xl text-text-muted font-serif italic max-w-lg mx-auto">
                    Koa notices that you have become quiet. He speaks softly as the group continues walking. The island now feels quieter, and every shadow seems to have a story.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                  <button 
                    onClick={() => nextScene('start-tour')}
                    className="p-6 bg-white border-2 border-sand-dark rounded-[2rem] hover:border-turquoise hover:shadow-xl transition-all text-base font-serif font-bold text-deep-sea shadow-sm"
                  >
                    I stay close to Koa.
                  </button>
                  <button 
                    onClick={() => nextScene('start-tour')}
                    className="p-6 bg-white border-2 border-sand-dark rounded-[2rem] hover:border-turquoise hover:shadow-xl transition-all text-base font-serif font-bold text-deep-sea shadow-sm"
                  >
                    I keep thinking about the gift.
                  </button>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'start-tour' && (
            <SceneWrapper key="start-tour">
              <TourStopIndicator current={29} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-5xl mx-auto journal-card p-2 sm:p-3 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0 items-stretch">
                  <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                    <img 
                      src={SCENE_ASSETS.nightTour} 
                      alt="Hawaii Night" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-sea/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white text-left">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Night Tour</p>
                      <p className="font-serif italic text-xl">The stars are coming out</p>
                    </div>
                  </div>
                  <div className="p-8 sm:p-12 space-y-8 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-deep-sea/10 text-deep-sea rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display">
                        <Moon size={14} />
                        Night Tour
                      </div>
                      <h2 className="text-4xl sm:text-5xl font-serif font-medium leading-tight text-deep-sea">The stars are coming out.</h2>
                      <p className="text-text-main leading-relaxed text-lg font-serif">
                        "The day is ending, and a different island is waking up," Koa says gently. 
                        The path ahead feels more personal now. "Let's discover the quieter, hidden side of Hawaii together."
                      </p>
                    </div>
                    <div className="space-y-4">
                      <button 
                        onClick={() => nextScene('landmark')}
                        className="w-full p-6 bg-sand/30 border-2 border-sand-dark rounded-[2rem] text-left hover:border-turquoise hover:bg-white transition-all font-serif text-lg font-medium text-text-main shadow-sm"
                      >
                        "I'm excited! Let's go."
                      </button>
                      <button 
                        onClick={() => nextScene('landmark')}
                        className="w-full p-6 bg-sand/30 border-2 border-sand-dark rounded-[2rem] text-left hover:border-turquoise hover:bg-white transition-all font-serif text-lg font-medium text-text-main shadow-sm"
                      >
                        "I'm a bit nervous, but okay."
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'landmark' && (
            <SceneWrapper key="landmark">
              <TourStopIndicator current={30} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="space-y-10 text-center max-w-4xl mx-auto">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sand-dark/20 text-deep-sea rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display">
                    Landmark Stop
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium text-deep-sea">Look at that mountain!</h2>
                  <p className="text-text-muted max-w-xl mx-auto font-serif text-lg sm:text-xl italic">
                    Koa points to a famous landmark. It is an old volcano called Diamond Head. 
                    Click on the landmark to learn more.
                  </p>
                </div>
                
                <div className="relative max-w-3xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer border-8 border-white" onClick={() => nextScene('sacred-place')}>
                  <img 
                    src="https://raw.githubusercontent.com/Blaswe02/IntroductionHawaii/main/diamondhead.jpg" 
                    alt="Diamond Head" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-white/50 animate-ping absolute" />
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-turquoise shadow-2xl">
                      <MapPin size={32} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-deep-sea/80 to-transparent text-white text-left">
                    <p className="font-serif text-2xl">Diamond Head (Lēʻahi)</p>
                    <p className="text-sm opacity-80 font-display uppercase tracking-widest">Tap to explore</p>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {/* Removed old kind-moment and receive-talisman scenes */}

          {currentScene === 'sacred-place' && (
            <SceneWrapper key="sacred-place">
              <TourStopIndicator current={31} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-5xl mx-auto journal-card p-2 sm:p-3 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0 items-stretch">
                  <div className="p-8 sm:p-12 space-y-8 flex flex-col justify-center">
                    <div className="space-y-6">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-palm/10 text-palm rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display">
                        Sacred Nature
                      </div>
                      <h2 className="text-4xl sm:text-5xl font-serif font-medium leading-tight text-deep-sea">A quiet, sacred place.</h2>
                      <p className="text-text-main leading-relaxed text-lg sm:text-xl font-serif">
                        Koa leads you to a beautiful waterfall. "This is a sacred place," he whispers. 
                        "In Hawaii, nature has a spirit."
                      </p>
                      <p className="text-text-muted italic font-serif text-lg">
                        Take a moment to look at the water and the green leaves.
                      </p>
                    </div>
                    <button 
                      onClick={() => nextScene('talisman-glow')}
                      className="w-full sm:w-auto bg-deep-sea text-white px-10 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                    >
                      Look closer
                    </button>
                  </div>
                  <div className="rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[500px]">
                    <img 
                      src={SCENE_ASSETS.scene9} 
                      alt="Jungle Waterfall" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'talisman-glow' && (
            <SceneWrapper key="talisman-glow">
              <TourStopIndicator current={32} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="text-center space-y-10 max-w-2xl mx-auto">
                <div className="relative">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        '0 0 20px rgba(6,182,212,0.2)',
                        '0 0 60px rgba(6,182,212,0.6)',
                        '0 0 20px rgba(6,182,212,0.2)'
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-40 h-40 bg-turquoise rounded-[2.5rem] mx-auto flex items-center justify-center text-white shadow-2xl"
                  >
                    <Sparkles size={64} />
                  </motion.div>
                </div>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-turquoise/10 text-turquoise rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display">
                    The Glow
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-serif font-medium text-deep-sea">It's glowing!</h2>
                  <p className="text-xl sm:text-2xl text-text-main leading-relaxed font-serif italic">
                    The talisman in your hand starts to shine with a soft, blue light. 
                    How do you react?
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <button onClick={() => nextScene('cabin-glow-1')} className="p-6 bg-white border-2 border-sand-dark rounded-[2rem] hover:border-turquoise hover:shadow-xl transition-all font-serif text-lg font-bold text-deep-sea shadow-sm">
                    "Wow! This is magic."
                  </button>
                  <button onClick={() => nextScene('cabin-glow-1')} className="p-6 bg-white border-2 border-sand-dark rounded-[2rem] hover:border-turquoise hover:shadow-xl transition-all font-serif text-lg font-bold text-deep-sea shadow-sm">
                    "I should show this to Koa."
                  </button>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'cabin-glow-1' && (
            <SceneWrapper key="cabin-glow-1">
              <TourStopIndicator current={33} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="text-center space-y-10 max-w-3xl mx-auto">
                <div className="rounded-[3rem] overflow-hidden shadow-2xl aspect-video relative border-8 border-white">
                  <img 
                    src={SCENE_ASSETS.scene16} 
                    alt="Night Cabin" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-deep-sea/30 backdrop-blur-[1px]" />
                </div>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sand-dark/20 text-deep-sea rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display">
                    The Quiet Cabin
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-serif font-medium text-deep-sea">Back at the Cabin</h2>
                  <div className="space-y-6 text-text-main leading-relaxed text-lg sm:text-xl font-serif max-w-xl mx-auto">
                    <p>
                      Later that night, you are back in your cabin alone. The evening is quiet now. Outside, you hear only soft wind, distant nature sounds, and the movement of leaves in the dark.
                    </p>
                    <p>
                      You sit down for a moment and think about the tour, the village, and the strange woman who gave you the talisman.
                    </p>
                    <p className="font-bold text-deep-sea text-2xl">
                      Then something changes. A soft light appears in the room.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => nextScene('cabin-glow-2')}
                  className="bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                >
                  Look at the talisman
                </button>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'cabin-glow-2' && (
            <SceneWrapper key="cabin-glow-2">
              <TourStopIndicator current={34} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="text-center space-y-10 max-w-2xl mx-auto relative">
                <div className="rounded-[3rem] overflow-hidden shadow-2xl aspect-video relative border-8 border-white">
                  <img 
                    src={SCENE_ASSETS.scene17} 
                    alt="Talisman Glow" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-turquoise/20 mix-blend-overlay" />
                </div>

                <div className="space-y-6">
                  <h2 className="text-4xl sm:text-5xl font-serif font-medium text-deep-sea">A Soft Glow</h2>
                  <div className="space-y-6 text-text-main leading-relaxed text-lg sm:text-xl font-serif max-w-lg mx-auto">
                    <p>
                      The talisman begins to shine with a gentle light. The room feels different, as if it is waiting for something.
                    </p>
                    <p>
                      You hear a soft voice in the quiet room.
                    </p>
                    <p className="font-serif text-2xl text-deep-sea italic leading-relaxed">
                      “You noticed what others ignored. That is why I am here.”
                    </p>
                  </div>
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-8">
                  <div className="space-y-2 text-center">
                    <p className="text-[10px] font-bold text-turquoise uppercase tracking-[0.2em] font-display">Your Choice</p>
                    <h3 className="text-2xl font-serif text-deep-sea">What do you do?</h3>
                  </div>

                  {!cabinGlowAnswered ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        'I ask, “Who is there?”',
                        'I touch the talisman.',
                        'I stay quiet and listen.',
                        'I step back.'
                      ].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setCabinGlowAnswered(true);
                            setCabinGlowChoice(option);
                          }}
                          className="p-6 text-left bg-sand/30 border-2 border-sand-dark rounded-[2rem] hover:border-turquoise hover:bg-white transition-all font-serif text-lg font-bold text-deep-sea shadow-sm"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-6"
                    >
                      <div className="p-6 bg-palm/10 text-palm rounded-[2rem] border border-palm/20 max-w-lg mx-auto">
                        <p className="font-serif italic text-lg">“The light grows warmer, as if it is listening to you.”</p>
                      </div>
                      <button 
                        onClick={() => nextScene('companion-forming')}
                        className="bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                      >
                        Wait and see
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'companion-forming' && (
            <SceneWrapper key="companion-forming">
              <TourStopIndicator current={35} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="text-center space-y-10 max-w-3xl mx-auto">
                <div className="relative">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="w-48 h-48 bg-gradient-to-br from-turquoise to-deep-sea rounded-full mx-auto flex items-center justify-center shadow-2xl relative"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                    <Sparkles size={80} className="text-white relative z-10" />
                  </motion.div>
                </div>
                <div className="space-y-6">
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium text-deep-sea">Your Companion</h2>
                  <div className="space-y-6 text-text-main leading-relaxed text-lg sm:text-xl font-serif max-w-xl mx-auto">
                    <p>
                      The light begins to change shape. It moves gently, as if it already knows you.
                    </p>
                    <p>
                      Then the voice speaks again.
                    </p>
                    <p className="font-serif text-2xl text-deep-sea italic leading-relaxed">
                      “I am not here by accident. I woke up because you noticed something small, and because you chose kindness.”
                    </p>
                    <p>
                      The light grows brighter.
                    </p>
                    <p className="font-serif text-2xl text-deep-sea italic leading-relaxed">
                      “I can guide you through this place. I can help you understand what Hawaii is trying to teach you.”
                    </p>
                    <p className="font-bold text-deep-sea pt-4 text-2xl">
                      “What kind of guide do you need?”
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => nextScene('selection')}
                  className="bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                >
                  Choose your guide
                </button>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'selection' && (
            <SceneWrapper key="selection">
              <TourStopIndicator current={36} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="space-y-12 max-w-5xl mx-auto">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium text-deep-sea">What kind of guide do you need?</h2>
                  <p className="text-text-muted text-xl font-serif italic text-palm">Choose the style that fits you best.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
                  {(['wise', 'calm', 'playful', 'brave', 'gentle'] as const).map((style) => (
                    <motion.button
                      key={style}
                      whileHover={{ y: -12 }}
                      onClick={() => {
                        const companion = COMPANIONS.find(c => c.style === style);
                        if (companion) {
                          setSelectedCompanion(companion);
                          // Save journey data to Firestore
                          try {
                            addDoc(collection(db, 'journeys'), {
                              firstName,
                              classGroup,
                              spiritAnimal: companion.type,
                              timestamp: serverTimestamp(),
                              completed: false
                            });
                          } catch (error) {
                            console.error("Error saving journey:", error);
                          }
                          nextScene('reveal');
                        }
                      }}
                      className="p-8 bg-white border-2 border-sand-dark rounded-[2.5rem] text-center space-y-6 hover:border-turquoise hover:shadow-2xl transition-all group shadow-sm"
                    >
                      <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto text-text-muted group-hover:text-turquoise transition-colors shadow-inner">
                        <Sparkles size={32} />
                      </div>
                      <h3 className="font-display font-bold text-lg uppercase tracking-widest text-deep-sea">{style}</h3>
                    </motion.button>
                  ))}
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'reveal' && selectedCompanion && (
            <SceneWrapper key="reveal">
              <TourStopIndicator current={37} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="space-y-12 max-w-4xl mx-auto">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium text-deep-sea">The Spirit Reveals Itself</h2>
                  <p className="text-text-muted text-xl font-serif italic text-palm">A magical presence takes shape in the light.</p>
                </div>

                <div className="journal-card p-2 sm:p-4 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-8 items-center p-6 sm:p-10">
                    <div className="relative group">
                      <div className={`absolute -inset-4 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity ${selectedCompanion.color}`} />
                      <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-square border-4 border-white">
                        <img 
                          src={getCompanionImage(selectedCompanion.type)} 
                          alt={selectedCompanion.type} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-2xl sm:text-3xl font-serif text-deep-sea italic leading-tight">
                          {selectedCompanion.revealText}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCompanion.traits.map(trait => (
                            <span key={trait} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display ${selectedCompanion.color} text-white`}>
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 bg-sand/50 rounded-3xl border border-sand-dark space-y-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-display">How I help you:</p>
                        <p className="text-text-main font-serif italic text-lg leading-relaxed">
                          {selectedCompanion.helpExplanation}
                        </p>
                      </div>

                      <button 
                        onClick={() => nextScene('naming')}
                        className="w-full bg-deep-sea text-white py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 flex items-center justify-center gap-3"
                      >
                        Learn my Name
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'naming' && selectedCompanion && (
            <SceneWrapper key="naming">
              <TourStopIndicator current={38} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="space-y-10 max-w-2xl mx-auto">
                <div className="text-center space-y-8">
                  <div className="relative">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`w-48 h-48 ${selectedCompanion.color} rounded-full mx-auto flex items-center justify-center text-white shadow-2xl mb-8 relative border-4 border-white`}
                    >
                      <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse" />
                      {selectedCompanion.type === 'Owl' && <Sun size={80} className="relative z-10" />}
                      {selectedCompanion.type === 'Sea Turtle' && <Waves size={80} className="relative z-10" />}
                      {selectedCompanion.type === 'Gecko' && <Sparkles size={80} className="relative z-10" />}
                      {selectedCompanion.type === 'Fox' && <Compass size={80} className="relative z-10" />}
                      {selectedCompanion.type === 'Deer' && <Heart size={80} className="relative z-10" />}
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-serif font-medium leading-tight text-deep-sea italic">"For now, you may call me..."</h2>
                    <p className="text-text-muted font-display uppercase tracking-widest text-[10px] font-bold">Give your companion a temporary name.</p>
                  </div>
                </div>

                <div className="journal-card p-10 space-y-6 text-center">
                  <input 
                    type="text" 
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    placeholder={selectedCompanion.tempName}
                    className="w-full max-w-sm p-6 bg-sand/30 border-2 border-sand-dark rounded-[2rem] text-center focus:ring-4 focus:ring-turquoise/20 focus:border-turquoise outline-none text-2xl font-serif text-deep-sea shadow-inner"
                  />
                  <div className="pt-6 flex flex-col gap-4">
                    <button 
                      onClick={() => nextScene('first-conversation')}
                      className="bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                    >
                      Confirm Name
                    </button>
                  </div>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'first-conversation' && selectedCompanion && (
            <SceneWrapper key="first-conversation">
              <TourStopIndicator current={39} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="space-y-10 max-w-3xl mx-auto">
                <div className="text-center space-y-6">
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium text-deep-sea">Your First Conversation</h2>
                  <button 
                    onClick={() => goToStory('naming')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-turquoise uppercase tracking-widest hover:text-deep-sea transition-colors font-display"
                  >
                    <ArrowLeft size={16} />
                    Go Back to Story
                  </button>
                  <div className="space-y-6 text-text-main leading-relaxed text-lg sm:text-xl font-serif">
                    <p>The room is quiet, but everything feels different.</p>
                    <p>Your companion stays close and looks at you carefully.</p>
                    <p className="font-serif text-2xl text-deep-sea italic leading-relaxed">
                      “I will travel with you from now on,” it says. “But first, I want to know what you noticed tonight.”
                    </p>
                  </div>
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-turquoise uppercase tracking-[0.2em] font-display">Why are you in Hawaii?</label>
                      <input 
                        type="text"
                        value={conversationAnswers.q1}
                        onChange={(e) => setConversationAnswers({...conversationAnswers, q1: e.target.value})}
                        placeholder="Write 1 short sentence."
                        className="w-full p-6 bg-sand/30 border-2 border-sand-dark rounded-[2rem] focus:ring-4 focus:ring-turquoise/20 focus:border-turquoise outline-none font-serif text-lg text-deep-sea"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-turquoise uppercase tracking-[0.2em] font-display">What did you notice during the tour?</label>
                      <input 
                        type="text"
                        value={conversationAnswers.q2}
                        onChange={(e) => setConversationAnswers({...conversationAnswers, q2: e.target.value})}
                        placeholder="Write 1 or 2 things you remember."
                        className="w-full p-6 bg-sand/30 border-2 border-sand-dark rounded-[2rem] focus:ring-4 focus:ring-turquoise/20 focus:border-turquoise outline-none font-serif text-lg text-deep-sea"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-turquoise uppercase tracking-[0.2em] font-display">Which Hawaiian word do you remember best?</label>
                      <input 
                        type="text"
                        value={conversationAnswers.q3}
                        onChange={(e) => setConversationAnswers({...conversationAnswers, q3: e.target.value})}
                        placeholder="For example: aloha, mahalo, kai, ʻohana"
                        className="w-full p-6 bg-sand/30 border-2 border-sand-dark rounded-[2rem] focus:ring-4 focus:ring-turquoise/20 focus:border-turquoise outline-none font-serif text-lg text-deep-sea"
                      />
                    </div>
                  </div>

                  {!conversationSubmitted ? (
                    <div className="space-y-4">
                      <button 
                        onClick={() => setConversationSubmitted(true)}
                        disabled={!conversationAnswers.q1 || !conversationAnswers.q2 || !conversationAnswers.q3}
                        className="w-full bg-deep-sea text-white py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20 disabled:opacity-50"
                      >
                        Answer Companion
                      </button>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <CompanionBubble 
                        companion={selectedCompanion} 
                        text="Good. You were paying attention. Learning begins when you really notice a place." 
                      />
                      <button 
                        onClick={() => nextScene('end-check')}
                        className="w-full bg-turquoise text-white py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-deep-sea transition-all shadow-xl shadow-turquoise/20"
                      >
                        Go to End Check
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'end-check' && (
            <SceneWrapper key="end-check">
              <TourStopIndicator current={40} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-3xl mx-auto space-y-10">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sand-dark/20 text-deep-sea rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-display">
                    End Check
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-serif font-medium text-deep-sea">End Check</h2>
                  <p className="text-text-muted text-xl font-serif italic">Answer these short questions about your first night in Hawaii.</p>
                  <StoryRecallButton onOpen={() => setIsStoryNavigatorOpen(true)} />
                </div>

                <div className="journal-card p-8 sm:p-12 space-y-10 relative overflow-hidden">
                  <div className="flex justify-center gap-3">
                    {END_CHECK_QUESTIONS.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-2 rounded-full transition-all duration-500 ${i === endCheckStep ? 'w-12 bg-turquoise' : 'w-3 bg-sand-dark'}`}
                      />
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={endCheckStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="space-y-3 text-center">
                        <p className="text-[10px] font-bold text-turquoise uppercase tracking-[0.2em] font-display">{END_CHECK_QUESTIONS[endCheckStep].category}</p>
                        <h3 className="text-2xl sm:text-3xl font-serif text-deep-sea leading-tight">{END_CHECK_QUESTIONS[endCheckStep].question}</h3>
                      </div>

                      {!endCheckFeedback ? (
                        <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto">
                          {END_CHECK_QUESTIONS[endCheckStep].options.map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                const isCorrect = option === END_CHECK_QUESTIONS[endCheckStep].correct;
                                setEndCheckCorrect(isCorrect);
                                setEndCheckFeedback(END_CHECK_QUESTIONS[endCheckStep].feedback);
                              }}
                              className="p-6 text-left bg-sand/30 border-2 border-sand-dark rounded-[2rem] hover:border-turquoise hover:bg-white transition-all font-serif text-lg font-bold text-deep-sea shadow-sm"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-8 text-center max-w-xl mx-auto"
                        >
                          <div className={`p-8 rounded-[2.5rem] border-2 ${endCheckCorrect ? 'bg-palm/10 text-palm border-palm/20' : 'bg-coral/10 text-coral border-coral/20'}`}>
                            <p className="text-xl font-serif italic leading-relaxed">{endCheckFeedback}</p>
                          </div>
                          <button 
                            onClick={() => {
                              if (endCheckStep < END_CHECK_QUESTIONS.length - 1) {
                                setEndCheckStep(endCheckStep + 1);
                                setEndCheckFeedback(null);
                                setEndCheckCorrect(null);
                              } else {
                                nextScene('final-unlock');
                              }
                            }}
                            className="bg-deep-sea text-white px-12 py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                          >
                            {endCheckStep < END_CHECK_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Check'}
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </SceneWrapper>
          )}

          {currentScene === 'final-unlock' && selectedCompanion && (
            <SceneWrapper key="final-unlock">
              <TourStopIndicator current={41} total={41} sceneId={currentScene} onOpenNavigator={() => setIsStoryNavigatorOpen(true)} />
              <div className="max-w-lg mx-auto">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 1 }}
                  className="journal-card overflow-hidden border-8 border-white shadow-2xl"
                >
                  <div className={`${selectedCompanion.color} p-16 text-center text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <motion.div 
                      animate={{ y: [0, -15, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="relative z-10"
                    >
                      {selectedCompanion.type === 'Owl' && <Sun size={100} className="mx-auto" />}
                      {selectedCompanion.type === 'Sea Turtle' && <Waves size={100} className="mx-auto" />}
                      {selectedCompanion.type === 'Gecko' && <Sparkles size={100} className="mx-auto" />}
                      {selectedCompanion.type === 'Fox' && <Compass size={100} className="mx-auto" />}
                      {selectedCompanion.type === 'Deer' && <Heart size={100} className="mx-auto" />}
                    </motion.div>
                  </div>
                  
                  <div className="p-12 text-center space-y-8">
                    <div className="space-y-3">
                      <h2 className="text-4xl sm:text-5xl font-serif font-medium text-deep-sea">Companion Awakened</h2>
                      <p className="text-text-muted italic font-serif text-xl">Your journey continues together.</p>
                    </div>

                    <div className="space-y-6 text-text-main leading-relaxed text-lg font-serif">
                      <p>This is only the beginning.</p>
                      <p>Your companion will help you understand Hawaii, ask you questions, and guide you through new stories.</p>
                      <p className="font-bold text-deep-sea text-xl">For now, rest. Tomorrow, the islands have more to share.</p>
                    </div>

                    <div className="pt-8 space-y-4">
                      <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-deep-sea text-white py-5 rounded-full font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-turquoise transition-all shadow-xl shadow-deep-sea/20"
                      >
                        Finish Lesson 1
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </SceneWrapper>
          )}
        </AnimatePresence>

        {/* Back to Task Button (Review Mode) */}
        {taskReturnScene && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60]">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                setCurrentScene(taskReturnScene);
                setTaskReturnScene(null);
              }}
              className="bg-turquoise text-white px-8 py-4 rounded-full font-display font-bold text-xs uppercase tracking-widest shadow-2xl hover:bg-deep-sea transition-all flex items-center gap-3 border-2 border-white"
            >
              <ArrowRight size={20} />
              Back to Task
            </motion.button>
          </div>
        )}

      {/* AI Companion Modal */}
        <AnimatePresence>
        </AnimatePresence>

        <StoryNavigatorOverlay 
          isOpen={isStoryNavigatorOpen}
          onClose={() => setIsStoryNavigatorOpen(false)}
          currentScene={currentScene}
          visitedScenes={visitedScenes}
          onJump={jumpToStoryPage}
        />

        <PasscodeModal 
          isOpen={showPasscodeModal}
          onClose={() => {
            setShowPasscodeModal(false);
            setPasscodeAttempt('');
          }}
          attempt={passcodeAttempt}
          onAttemptChange={setPasscodeAttempt}
          onVerify={(isValid) => {
            if (isValid) {
              setIsTeacherMode(true);
              setShowPasscodeModal(false);
              setPasscodeAttempt('');
            }
          }}
        />

        {isTeacherMode && (
          <TeacherControls 
            currentScene={currentScene}
            onJump={(id) => setCurrentScene(id)}
            onExit={() => setIsTeacherMode(false)}
          />
        )}

        <AnimatePresence>
          {activeTaskScene && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="fixed bottom-10 right-10 z-[60]"
            >
              <button 
                onClick={() => {
                  setCurrentScene(activeTaskScene);
                  setActiveTaskScene(null);
                }}
                className="bg-coral text-white px-8 py-4 rounded-full font-display font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-coral/30 hover:bg-deep-sea hover:scale-105 transition-all flex items-center gap-3 active:scale-95"
              >
                <ArrowLeft size={18} />
                Back to Task
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-[10px] text-text-muted border-t border-sand-dark/30 bg-white/50 font-display uppercase tracking-[0.2em]">
        <p>&copy; 2026 Hawaii English Learning Project • VMBO Kader/Mavo Edition</p>
      </footer>
    </div>
  );
}

function PasscodeModal({ 
  isOpen, 
  onClose, 
  attempt, 
  onAttemptChange, 
  onVerify 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  attempt: string,
  onAttemptChange: (val: string) => void,
  onVerify: (isValid: boolean) => void
}) {
  const [error, setError] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const encoded = new TextEncoder().encode(attempt.toLowerCase());
    const buf = await crypto.subtle.digest('SHA-256', encoded);
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (hex === '195f33b50fa62ef2bd3d89227ecc1219419e3b907579718541f22cd1b1f1f5e4') {
      onVerify(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-deep-sea/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden p-10 space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-sand rounded-2xl flex items-center justify-center mx-auto text-deep-sea shadow-inner">
                <Compass size={32} />
              </div>
              <h3 className="text-2xl font-serif text-deep-sea">Teacher Access</h3>
              <p className="text-sm text-text-muted font-sans tracking-wide">Enter the passcode to enable preview mode.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <input 
                  autoFocus
                  type="password" 
                  value={attempt}
                  onChange={(e) => onAttemptChange(e.target.value)}
                  placeholder="Passcode"
                  className={`w-full p-5 bg-sand/30 border-2 rounded-2xl text-center focus:ring-4 outline-none transition-all font-sans text-lg tracking-widest ${
                    error ? 'border-coral ring-coral/20' : 'border-sand-dark focus:ring-turquoise/20 focus:border-turquoise'
                  }`}
                />
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-coral uppercase tracking-widest text-center pt-1"
                  >
                    Incorrect Passcode
                  </motion.p>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 rounded-xl border border-sand-dark text-xs font-bold uppercase tracking-widest text-text-muted hover:bg-sand transition-colors font-display"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-deep-sea text-white px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-turquoise transition-all shadow-lg font-display"
                >
                  Unlock
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function TeacherControls({
  currentScene,
  onJump,
  onExit
}: {
  currentScene: SceneId,
  onJump: (id: SceneId) => void,
  onExit: () => void
}) {
  const allScenes = SCENE_STOPS.flatMap(s => s.scenes);
  const currentIndex = allScenes.findIndex(s => s.id === currentScene);
  const prevScene = allScenes[currentIndex - 1];
  const nextScene = allScenes[currentIndex + 1];

  const [showDashboard, setShowDashboard] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const q = query(collection(db, 'journeys'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      setStudents([]);
    }
    setLoadingStudents(false);
  };

  const openDashboard = () => {
    setShowDashboard(true);
    loadStudents();
  };

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t-2 border-turquoise/30 z-[150] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 sm:p-6"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-turquoise text-white rounded-xl shadow-lg shadow-turquoise/20 shrink-0">
            <Compass size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest font-display">Teacher Preview Mode</span>
          </div>
          <div className="hidden lg:block text-deep-sea">
            <p className="text-[9px] font-bold uppercase tracking-widest font-display opacity-40">Current View</p>
            <p className="text-sm font-serif italic truncate max-w-[200px]">{allScenes[currentIndex]?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            disabled={!prevScene}
            onClick={() => prevScene && onJump(prevScene.id)}
            className="p-3 bg-sand/50 border border-sand-dark rounded-xl hover:bg-white hover:border-turquoise disabled:opacity-20 transition-all group"
            title="Previous Page"
          >
            <ArrowLeft size={20} className="text-deep-sea group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <select 
            value={currentScene}
            onChange={(e) => onJump(e.target.value as SceneId)}
            className="px-6 py-3 bg-sand/30 border-2 border-sand-dark rounded-xl font-serif text-sm text-deep-sea focus:border-turquoise focus:ring-4 focus:ring-turquoise/10 outline-none max-w-[240px] truncate"
          >
            {SCENE_STOPS.map(stop => (
              <optgroup key={stop.id} label={`Stop ${stop.id}: ${stop.name}`}>
                {stop.scenes.map(scene => (
                  <option key={scene.id} value={scene.id}>
                    {scene.label} {scene.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <button 
            disabled={!nextScene}
            onClick={() => nextScene && onJump(nextScene.id)}
            className="p-3 bg-sand/50 border border-sand-dark rounded-xl hover:bg-white hover:border-turquoise disabled:opacity-20 transition-all group"
            title="Next Page"
          >
            <ChevronRight size={20} className="text-deep-sea group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openDashboard}
            className="flex items-center gap-2 px-6 py-3 bg-turquoise/20 border-2 border-turquoise text-turquoise rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-turquoise hover:text-white transition-all font-display"
          >
            <BookOpen size={16} />
            Student Results
          </button>
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-6 py-3 bg-coral text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-coral/20 hover:bg-deep-sea transition-all active:scale-95 font-display"
          >
            <X size={16} />
            Exit Preview
          </button>
        </div>
      </div>
    </motion.div>

    {showDashboard && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-deep-sea/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[80vh] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-sand-dark">
            <div>
              <h2 className="text-2xl font-serif text-deep-sea">Student Results</h2>
              <p className="text-xs text-text-muted font-display uppercase tracking-widest mt-1">{students.length} inzending{students.length !== 1 ? 'en' : ''}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={loadStudents} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-turquoise border border-turquoise rounded-xl hover:bg-turquoise hover:text-white transition-all font-display">
                Refresh
              </button>
              <button onClick={() => setShowDashboard(false)} className="p-2 rounded-xl hover:bg-sand transition-colors">
                <X size={20} className="text-deep-sea" />
              </button>
            </div>
          </div>

          <div className="overflow-auto flex-1 p-6">
            {loadingStudents ? (
              <div className="flex items-center justify-center py-20 text-text-muted font-serif italic">Loading...</div>
            ) : students.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-text-muted font-serif italic">Nog geen inzendingen.</div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest text-text-muted font-display border-b border-sand-dark">Naam</th>
                    <th className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest text-text-muted font-display border-b border-sand-dark">Klas</th>
                    <th className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest text-text-muted font-display border-b border-sand-dark">Spirit Animal</th>
                    <th className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest text-text-muted font-display border-b border-sand-dark">Naam dier</th>
                    <th className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest text-text-muted font-display border-b border-sand-dark">Waarom Hawaii?</th>
                    <th className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest text-text-muted font-display border-b border-sand-dark">Opgemerkt</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-text-muted font-display border-b border-sand-dark">Hawaiiaans woord</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id} className={i % 2 === 0 ? 'bg-sand/20' : ''}>
                      <td className="py-3 pr-4 font-serif text-deep-sea">{s.firstName || '—'}</td>
                      <td className="py-3 pr-4 font-display text-xs text-text-muted">{s.classGroup || '—'}</td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-1 bg-turquoise/10 text-turquoise rounded-lg text-xs font-bold font-display">
                          {s.companionType || '—'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-serif italic text-text-muted text-xs">{s.companionName || '—'}</td>
                      <td className="py-3 pr-4 text-xs text-text-main max-w-[160px]">{s.answers?.q1 || '—'}</td>
                      <td className="py-3 pr-4 text-xs text-text-main max-w-[160px]">{s.answers?.q2 || '—'}</td>
                      <td className="py-3 text-xs font-bold text-deep-sea">{s.answers?.q3 || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    )}
  );
}

function SceneWrapper({ children }: { children: ReactNode, key?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="w-full relative z-10"
    >
      {children}
    </motion.div>
  );
}

function StoryRecallButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button 
      onClick={onOpen}
      className="flex items-center gap-2 px-6 py-2.5 bg-sand/20 border-2 border-sand-dark rounded-full text-[10px] font-bold text-deep-sea uppercase tracking-[0.15em] font-display hover:bg-turquoise hover:text-white hover:border-turquoise transition-all shadow-sm active:scale-95 group mx-auto mb-6"
    >
      <BookOpen size={14} className="group-hover:rotate-12 transition-transform" />
      Review Story Pages
    </button>
  );
}

function TourStopIndicator({ 
  current, 
  total, 
  sceneId, 
  onOpenNavigator 
}: { 
  current: number, 
  total: number, 
  sceneId: SceneId,
  onOpenNavigator?: () => void 
}) {
  const currentStop = SCENE_STOPS.find(s => s.scenes.some(p => p.id === sceneId));
  const currentSceneInfo = currentStop?.scenes.find(p => p.id === sceneId);
  const isTask = currentSceneInfo?.type === 'task';

  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-palm/60 uppercase tracking-[0.2em] font-display">
            Island Journey • Stop {currentStop?.id || current}: {currentStop?.name}
            {currentSceneInfo && <span className="text-turquoise ml-2">({currentSceneInfo.label})</span>}
          </span>
          {isTask && onOpenNavigator && (
            <button 
              onClick={onOpenNavigator}
              className="px-3 py-1 bg-white border border-sand-dark rounded-full text-[9px] font-bold text-deep-sea hover:bg-turquoise hover:text-white hover:border-turquoise transition-all flex items-center gap-1.5 shadow-sm active:scale-95 group"
            >
              <BookOpen size={10} className="group-hover:animate-pulse" />
              Recall Earlier Pages
            </button>
          )}
        </div>
        <span className="text-[10px] font-bold text-palm/40 uppercase tracking-widest">
          {Math.round((current / total) * 100)}% Complete
        </span>
      </div>
      <div className="flex gap-1.5 h-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div 
            key={i} 
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              i < current 
                ? 'flex-[2] bg-turquoise shadow-[0_0_10px_rgba(72,201,176,0.3)]' 
                : i === current 
                  ? 'flex-[3] bg-coral animate-pulse'
                  : 'flex-1 bg-sand-dark'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function StoryNavigatorOverlay({ 
  isOpen, 
  onClose, 
  currentScene, 
  visitedScenes, 
  onJump 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  currentScene: SceneId, 
  visitedScenes: Set<SceneId>,
  onJump: (id: SceneId) => void
}) {
  const currentStop = SCENE_STOPS.find(s => s.scenes.some(p => p.id === currentScene));
  
  if (!currentStop) return null;

  // Only show scenes from the current stop that have been visited
  const visitedScenesInStop = currentStop.scenes.filter(s => visitedScenes.has(s.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-deep-sea/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className={`p-8 border-b border-sand-dark bg-sand/10 flex justify-between items-center`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-turquoise rounded-2xl flex items-center justify-center text-white shadow-lg shadow-turquoise/20">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-turquoise uppercase tracking-[0.2em] font-display">Lesson Progress</p>
                  <h3 className="text-2xl font-serif text-deep-sea">{currentStop.name}</h3>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-sand-dark/20 transition-colors bg-sand/30"
              >
                <X size={28} className="text-deep-sea" />
              </button>
            </div>
            
            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-text-muted uppercase tracking-widest font-display">Previously Visited Pages</h4>
                <p className="text-text-main font-serif italic text-lg leading-relaxed">
                  You can jump back to any previous page to reread information. Don't worry, your progress on the current task is saved.
                </p>
              </div>

              <div className="grid gap-4">
                {visitedScenesInStop.map((scene) => (
                  <button 
                    key={scene.id}
                    onClick={() => onJump(scene.id)}
                    className={`group w-full p-6 text-left rounded-[2rem] border-2 transition-all flex items-center justify-between ${
                      scene.id === currentScene 
                        ? 'border-turquoise bg-turquoise/5 cursor-default' 
                        : 'border-sand-dark hover:border-turquoise hover:shadow-xl hover:shadow-turquoise/5 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        scene.id === currentScene
                          ? 'bg-turquoise text-white'
                          : 'bg-sand text-deep-sea group-hover:bg-turquoise group-hover:text-white'
                      }`}>
                        {scene.label}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] font-display text-text-muted">
                            {scene.type === 'story' ? 'Story Page' : 'Memory Task'}
                          </span>
                        </div>
                        <span className={`font-serif text-xl block ${scene.id === currentScene ? 'text-deep-sea font-medium' : 'text-text-main group-hover:text-deep-sea'}`}>
                          {scene.title}
                        </span>
                      </div>
                    </div>
                    {scene.id === currentScene ? (
                      <div className="px-4 py-1.5 bg-turquoise/20 text-turquoise rounded-full text-[9px] font-bold uppercase tracking-widest">Current</div>
                    ) : (
                      <ArrowRight size={20} className="text-sand-dark group-hover:text-turquoise transition-colors group-hover:translate-x-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-8 bg-sand/5 text-center border-t border-sand-dark/50">
              <button 
                onClick={onClose}
                className="bg-deep-sea text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-coral transition-all shadow-lg font-display"
              >
                Close and Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CompanionBubble({ companion, text }: { companion: Companion, text: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex gap-5 items-start journal-card p-7 mt-10 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Palmtree size={80} className="rotate-12" />
      </div>
      <div className={`w-14 h-14 shrink-0 ${companion.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-deep-sea/10 rotate-[-3deg]`}>
        {companion.type === 'Owl' && <Sun size={28} />}
        {companion.type === 'Sea Turtle' && <Waves size={28} />}
        {companion.type === 'Gecko' && <Sparkles size={28} />}
        {companion.type === 'Fox' && <Compass size={28} />}
        {companion.type === 'Deer' && <Heart size={28} />}
      </div>
      <div className="space-y-1.5 relative z-10">
        <p className="text-[10px] font-bold text-turquoise uppercase tracking-[0.2em] font-display">{companion.tempName}</p>
        <p className="text-deep-sea/80 italic leading-relaxed font-serif text-lg">"{text}"</p>
      </div>
    </motion.div>
  );
}
