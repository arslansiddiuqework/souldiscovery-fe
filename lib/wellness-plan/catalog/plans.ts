import type { CatalogPlan } from "./types";

/**
 * Curated Wellness Plan catalog — stable metadata for the hub UI.
 * Progress/enrollments stay in localStorage; this is display + generation hints only.
 */
export const WELLNESS_PLAN_CATALOG: CatalogPlan[] = [
  {
    slug: "reduce-anxiety",
    title: "Reduce Anxiety Plan",
    category: "Anxiety",
    tags: ["Anxiety", "Emotional Wellbeing"],
    shortDescription:
      "Build calm, manage anxious thoughts and feel more in control, one step at a time.",
    introduction:
      "A gentle 14-day path to notice anxiety earlier, soften body tension, and practice small, steady coping skills—without rushing or forcing exposure.",
    goals: [
      "Recognize anxiety signals earlier",
      "Practice calming tools you can use anywhere",
      "Separate thoughts from facts",
      "Build a personal coping toolkit",
    ],
    whoItsFor:
      "Anyone feeling on-edge, worried, or tense who wants practical daily support—not a diagnosis.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "blush",
    icon: "flower2",
    keywords: ["anxiety", "worry", "calm", "nervous", "panic feelings"],
    primaryGoal: "reduce_anxiety",
    defaultActivities: ["breathing", "journaling", "mindfulness"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Mood Check-In", type: "mood_checkin" },
      { title: "Guided Calm Breathing", type: "breathing" },
      { title: "Identify Anxiety Triggers", type: "journal" },
      { title: "Separate Thoughts from Facts", type: "journal" },
      { title: "Grounding Exercise", type: "mindfulness" },
      { title: "Worry Journal", type: "journal" },
      { title: "Challenge an Anxious Prediction", type: "journal" },
      { title: "Practice a Small Manageable Step", type: "walk" },
      { title: "Recognize Personal Coping Strategies", type: "gratitude" },
      { title: "Review Progress and Next Steps", type: "ai_conversation" },
    ],
    safetyNotes:
      "This plan does not diagnose anxiety disorders. Seek urgent medical help for new or severe physical symptoms.",
  },
  {
    slug: "sleep-better",
    title: "Sleep Better Plan",
    category: "Sleep",
    tags: ["Sleep", "Stress"],
    shortDescription:
      "Create a calmer bedtime routine and learn to respond more gently to nighttime worries.",
    introduction:
      "Build a wind-down ritual, soften racing thoughts at night, and practice habits that support rest—without diagnosing insomnia or changing medications.",
    goals: [
      "Create a consistent wind-down routine",
      "Respond gently to nighttime worries",
      "Reduce bedtime stimulation",
      "Build a sustainable sleep plan",
    ],
    whoItsFor:
      "People who struggle to unwind at night, wake with racing thoughts, or want gentler sleep habits.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "lavender",
    icon: "moon",
    keywords: ["sleep", "insomnia", "bedtime", "rest", "night"],
    primaryGoal: "improve_sleep",
    defaultActivities: ["breathing", "journaling", "meditation"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Check In With Your Sleep Routine", type: "mood_checkin" },
      { title: "Notice Nighttime Thought Patterns", type: "journal" },
      { title: "Create a Wind-Down Ritual", type: "mindfulness" },
      { title: "Try a Relaxation Exercise", type: "breathing" },
      { title: "Explore Helpful Sleep Habits", type: "reading" },
      { title: "Reduce Bedtime Stimulation", type: "journal" },
      { title: "Write Down Tomorrow's Worries", type: "journal" },
      { title: "Practice a Consistent Wake-Up Routine", type: "gratitude" },
      { title: "Reflect on Changes in Your Routine", type: "journal" },
      { title: "Build a Sustainable Sleep Plan", type: "ai_conversation" },
    ],
    safetyNotes:
      "Do not stop prescribed medication. Seek medical advice for persistent sleep problems.",
  },
  {
    slug: "panic-support",
    title: "Panic Attack Support",
    category: "Immediate Support",
    tags: ["Anxiety", "Immediate Support"],
    shortDescription:
      "Access grounding tools and supportive steps when fear or overwhelming sensations arise.",
    introduction:
      "Immediate, calm tools you can use when sensations feel overwhelming—plus an optional short follow-up journey. This is not a diagnosis of a panic attack.",
    goals: [
      "Access grounding quickly",
      "Follow one step at a time",
      "Know when to seek medical help",
      "Build a personal support plan",
    ],
    whoItsFor:
      "Anyone needing calm, immediate support during intense fear or physical overwhelm.",
    suggestedDurationDays: 7,
    estimatedMinutesPerDay: "2–10 min",
    accent: "orchid",
    icon: "heartHandshake",
    keywords: ["panic", "overwhelmed", "fear", "immediate", "grounding"],
    primaryGoal: "reduce_anxiety",
    defaultActivities: ["breathing", "mindfulness", "journaling"],
    defaultDailyTime: "5_minutes",
    format: "immediate",
    activityOutline: [
      { title: "Calm Welcome & Safety Guidance", type: "mood_checkin" },
      { title: "Choose Grounding or Gentle Breathing", type: "mindfulness" },
      { title: "Follow One Step at a Time", type: "breathing" },
      { title: "Optional Reflection", type: "journal" },
      { title: "Understand Possible Triggers", type: "journal" },
      { title: "Identify Early Warning Signs", type: "journal" },
      { title: "Build a Personal Coping Toolkit", type: "gratitude" },
      { title: "Practice Grounding When Calm", type: "mindfulness" },
      { title: "Create a Personal Support Plan", type: "ai_conversation" },
      { title: "Review What Was Helpful", type: "journal" },
    ],
    safetyNotes:
      "New, severe, or unusual physical symptoms may need urgent medical assessment. AI tools are not emergency care.",
  },
  {
    slug: "lift-your-mood",
    title: "Lift Your Mood Plan",
    category: "Mood",
    tags: ["Mood", "Personal Growth"],
    shortDescription:
      "Take small, manageable steps toward everyday activities that matter to you.",
    introduction:
      "Low-pressure daily steps focused on meaningful activity, self-compassion, and noticing small wins—adapted when energy is low.",
    goals: [
      "Choose achievable daily tasks",
      "Notice small wins",
      "Practice self-compassion",
      "Build a sustainable routine",
    ],
    whoItsFor:
      "People feeling flat, low-energy, or disconnected who want gentle momentum—not shame.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "peach",
    icon: "sun",
    keywords: ["mood", "depression feelings", "low", "energy", "joy"],
    primaryGoal: "improve_mood",
    defaultActivities: ["gratitude", "walking", "journaling"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Gentle Mood Check-In", type: "mood_checkin" },
      { title: "Choose One Small Achievable Task", type: "journal" },
      { title: "Identify Activities That Feel Meaningful", type: "journal" },
      { title: "Build a Gentle Morning Routine", type: "mindfulness" },
      { title: "Notice Small Wins", type: "gratitude" },
      { title: "Connect With a Trusted Person", type: "ai_conversation" },
      { title: "Practice Self-Compassion", type: "meditation" },
      { title: "Plan a Manageable Activity", type: "walk" },
      { title: "Reflect on Energy and Mood", type: "journal" },
      { title: "Create a Sustainable Routine", type: "gratitude" },
    ],
    safetyNotes:
      "Persistent low mood or thoughts of self-harm deserve professional support. Use emergency resources if you are in immediate danger.",
  },
  {
    slug: "stop-overthinking",
    title: "Stop Overthinking Plan",
    category: "Anxiety",
    tags: ["Anxiety", "Focus"],
    shortDescription:
      "Break repetitive thought loops and focus on what you can influence.",
    introduction:
      "Learn to park worries, separate facts from assumptions, and choose practical next steps—without dismissing real problems.",
    goals: [
      "Interrupt unhelpful thought loops",
      "Separate facts from assumptions",
      "Schedule a worry window",
      "Take one practical next step",
    ],
    whoItsFor:
      "People stuck in rumination, decision loops, or mental replay who want clearer thinking.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "blue",
    icon: "brain",
    keywords: ["overthinking", "rumination", "worry", "thoughts", "loops"],
    primaryGoal: "reduce_overthinking",
    defaultActivities: ["journaling", "mindfulness", "breathing"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Identify a Repeating Thought", type: "journal" },
      { title: "Separate Facts From Assumptions", type: "journal" },
      { title: "Try a Thought-Distance Exercise", type: "mindfulness" },
      { title: "Schedule a Worry Window", type: "journal" },
      { title: "Identify What Is Within Your Control", type: "journal" },
      { title: "Practice Attention Shifting", type: "meditation" },
      { title: "Use a Short Worry Journal", type: "journal" },
      { title: "Challenge an Unhelpful Prediction", type: "journal" },
      { title: "Choose One Practical Next Step", type: "walk" },
      { title: "Review Helpful Strategies", type: "ai_conversation" },
    ],
  },
  {
    slug: "stress-burnout",
    title: "Stress & Burnout Recovery",
    category: "Stress",
    tags: ["Stress", "Personal Growth"],
    shortDescription:
      "Recognize pressure, create healthier boundaries and make space for recovery.",
    introduction:
      "Map stressors, protect energy, and build recovery habits—without blaming yourself for structural pressures.",
    goals: [
      "Identify current stressors",
      "Practice short recovery breaks",
      "Explore healthy boundaries",
      "Set one sustainable goal",
    ],
    whoItsFor:
      "Anyone feeling stretched thin by work, study, caregiving, or life load.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "mint",
    icon: "leaf",
    keywords: ["stress", "burnout", "pressure", "boundaries", "recovery"],
    primaryGoal: "reduce_stress",
    defaultActivities: ["breathing", "walking", "journaling"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Identify Current Stressors", type: "journal" },
      { title: "Rate Perceived Stress", type: "mood_checkin" },
      { title: "Practice a Short Relaxation Exercise", type: "breathing" },
      { title: "Separate Urgent From Non-Urgent Tasks", type: "journal" },
      { title: "Explore Healthy Boundaries", type: "journal" },
      { title: "Plan a Meaningful Break", type: "walk" },
      { title: "Identify Sources of Support", type: "gratitude" },
      { title: "Review Workload and Expectations", type: "journal" },
      { title: "Create a Recovery Routine", type: "mindfulness" },
      { title: "Set One Sustainable Goal", type: "ai_conversation" },
    ],
  },
  {
    slug: "confidence-self-esteem",
    title: "Confidence & Self-Esteem",
    category: "Confidence",
    tags: ["Confidence", "Personal Growth"],
    shortDescription:
      "Build self-trust, challenge harsh self-talk and recognize your personal strengths.",
    introduction:
      "Practice kinder inner dialogue, notice strengths, and take small confidence-building steps at your pace.",
    goals: [
      "Identify personal strengths",
      "Softened self-criticism",
      "Take manageable courage steps",
      "Reduce unhelpful comparisons",
    ],
    whoItsFor:
      "People wanting more self-trust in social, work, study, or everyday situations.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "peach",
    icon: "sparkles",
    keywords: ["confidence", "self-esteem", "self-talk", "worth", "courage"],
    primaryGoal: "build_confidence",
    defaultActivities: ["journaling", "gratitude", "ai_conversations"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Identify a Personal Strength", type: "gratitude" },
      { title: "Notice Self-Critical Thoughts", type: "journal" },
      { title: "Rewrite an Unfair Self-Judgment", type: "journal" },
      { title: "Recognize a Small Achievement", type: "gratitude" },
      { title: "Practice Self-Compassion", type: "meditation" },
      { title: "Identify Personal Values", type: "journal" },
      { title: "Take a Small Confidence-Building Step", type: "walk" },
      { title: "Reduce Unhelpful Comparisons", type: "journal" },
      { title: "Practice a Kind Inner Dialogue", type: "mindfulness" },
      { title: "Reflect on Personal Growth", type: "ai_conversation" },
    ],
  },
  {
    slug: "emotional-balance",
    title: "Emotional Balance Plan",
    category: "Emotional Wellbeing",
    tags: ["Emotional Wellbeing", "Mood"],
    shortDescription:
      "Understand your feelings and develop practical ways to respond thoughtfully.",
    introduction:
      "Name emotions, notice triggers, and choose helpful responses—without suppressing how you feel.",
    goals: [
      "Name emotions with more clarity",
      "Pause before reacting",
      "Build a personal coping toolkit",
      "Communicate needs more clearly",
    ],
    whoItsFor:
      "Anyone who wants more awareness and choice in emotional moments.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "lavender",
    icon: "heart",
    keywords: ["emotions", "balance", "feelings", "regulation", "awareness"],
    primaryGoal: "mindfulness",
    defaultActivities: ["journaling", "mindfulness", "breathing"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Name the Current Emotion", type: "mood_checkin" },
      { title: "Identify a Possible Trigger", type: "journal" },
      { title: "Notice Physical and Mental Signals", type: "mindfulness" },
      { title: "Pause Before Responding", type: "breathing" },
      { title: "Practice Grounding", type: "mindfulness" },
      { title: "Explore What the Emotion May Be Communicating", type: "journal" },
      { title: "Choose a Helpful Response", type: "journal" },
      { title: "Communicate a Need Clearly", type: "ai_conversation" },
      { title: "Reflect Without Self-Judgment", type: "gratitude" },
      { title: "Build a Personal Coping Toolkit", type: "journal" },
    ],
  },
  {
    slug: "loneliness-connection",
    title: "Loneliness & Connection",
    category: "Relationships",
    tags: ["Relationships", "Mood"],
    shortDescription:
      "Explore manageable ways to strengthen connection and create meaningful moments.",
    introduction:
      "Reflect on connection needs and take low-pressure steps toward belonging—including private options if you are not ready to reach out.",
    goals: [
      "Clarify what connection means to you",
      "Identify existing support",
      "Take one low-pressure social step",
      "Build a sustainable connection routine",
    ],
    whoItsFor:
      "People feeling lonely, isolated, or unsure how to reconnect without pressure.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "blush",
    icon: "users",
    keywords: ["loneliness", "connection", "social", "friendship", "belonging"],
    primaryGoal: "improve_mood",
    defaultActivities: ["journaling", "gratitude", "walking"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Reflect on What Connection Means", type: "journal" },
      { title: "Identify Existing Support", type: "gratitude" },
      { title: "Send a Low-Pressure Message", type: "journal" },
      { title: "Explore a Shared Interest", type: "reading" },
      { title: "Practice Starting a Conversation", type: "ai_conversation" },
      { title: "Set a Small Social Goal", type: "journal" },
      { title: "Recognize Barriers to Connection", type: "journal" },
      { title: "Reflect on Relationship Needs", type: "journal" },
      { title: "Explore Community Opportunities", type: "walk" },
      { title: "Build a Sustainable Connection Routine", type: "gratitude" },
    ],
  },
  {
    slug: "health-worry",
    title: "Health Worry & Body Anxiety",
    category: "Anxiety",
    tags: ["Anxiety", "Emotional Wellbeing"],
    shortDescription:
      "Respond more thoughtfully to health worries while respecting your physical wellbeing.",
    introduction:
      "Practice balanced responses to health-related worry while never dismissing real medical needs.",
    goals: [
      "Separate observations from interpretations",
      "Notice reassurance-seeking patterns",
      "Practice tolerating uncertainty",
      "Know when medical advice is appropriate",
    ],
    whoItsFor:
      "People caught in health-related worry cycles who still want to honor physical wellbeing.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "blue",
    icon: "activity",
    keywords: ["health anxiety", "body", "symptoms", "worry", "reassurance"],
    primaryGoal: "reduce_anxiety",
    defaultActivities: ["journaling", "breathing", "mindfulness"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Identify a Health-Related Worry", type: "journal" },
      { title: "Separate Observations From Interpretations", type: "journal" },
      { title: "Notice Reassurance-Seeking Patterns", type: "journal" },
      { title: "Practice Tolerating Uncertainty", type: "mindfulness" },
      { title: "Create a Balanced Information-Seeking Routine", type: "journal" },
      { title: "Reflect on Online Symptom Searching", type: "journal" },
      { title: "Use Grounding When Worried", type: "breathing" },
      { title: "Prepare Questions for a Healthcare Professional", type: "journal" },
      { title: "Identify When Medical Advice Is Appropriate", type: "reading" },
      { title: "Build a Supportive Next-Step Plan", type: "ai_conversation" },
    ],
    safetyNotes:
      "Never treat this plan as medical reassurance. Seek urgent care for concerning physical symptoms.",
  },
  {
    slug: "intrusive-thoughts",
    title: "Intrusive Thoughts & Clarity",
    category: "Anxiety",
    tags: ["Anxiety", "Emotional Wellbeing"],
    shortDescription:
      "Learn to notice unwanted thoughts without treating every thought as a fact or intention.",
    introduction:
      "Practice noticing unwanted thoughts with more distance and self-compassion—without diagnosing OCD or assuming intent.",
    goals: [
      "Notice thoughts without immediate judgment",
      "Practice thought distancing",
      "Reduce unhelpful thought suppression",
      "Identify helpful support",
    ],
    whoItsFor:
      "People distressed by unwanted thoughts who want calmer ways to relate to them.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "lavender",
    icon: "cloud",
    keywords: ["intrusive", "unwanted thoughts", "clarity", "OCD feelings"],
    primaryGoal: "reduce_overthinking",
    defaultActivities: ["mindfulness", "journaling", "meditation"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Learn What an Unwanted Thought Can Feel Like", type: "reading" },
      { title: "Notice Thoughts Without Immediate Judgment", type: "mindfulness" },
      { title: "Practice Thought Distancing", type: "meditation" },
      { title: "Return Attention to a Chosen Activity", type: "walk" },
      { title: "Respond to Uncertainty More Gently", type: "journal" },
      { title: "Reduce Unhelpful Thought Suppression", type: "journal" },
      { title: "Reflect on Personal Triggers", type: "journal" },
      { title: "Practice Self-Compassion", type: "gratitude" },
      { title: "Identify Helpful Support", type: "ai_conversation" },
      { title: "Review Useful Coping Strategies", type: "journal" },
    ],
    safetyNotes:
      "If you report intent to harm yourself or others, follow the app safety flow and seek immediate help.",
  },
  {
    slug: "grief-emotional-healing",
    title: "Grief & Emotional Healing",
    category: "Emotional Wellbeing",
    tags: ["Emotional Wellbeing", "Mood"],
    shortDescription:
      "Make room for difficult feelings and move through loss at your own pace.",
    introduction:
      "A flexible, self-paced journey that makes space for grief without timelines or forced disclosure.",
    goals: [
      "Make space for difficult emotions",
      "Create gentle daily rituals",
      "Recognize personal needs",
      "Choose helpful next steps",
    ],
    whoItsFor:
      "Anyone navigating loss or emotional healing who wants gentle, non-rushed support.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min when ready",
    accent: "lavender",
    icon: "flower",
    keywords: ["grief", "loss", "healing", "mourning", "bereavement"],
    primaryGoal: "mindfulness",
    defaultActivities: ["journaling", "gratitude", "meditation"],
    defaultDailyTime: "10_minutes",
    format: "flexible",
    activityOutline: [
      { title: "Check In With How Today Feels", type: "mood_checkin" },
      { title: "Make Space for a Difficult Emotion", type: "mindfulness" },
      { title: "Remember Something Meaningful", type: "journal" },
      { title: "Identify What Helps During Difficult Days", type: "journal" },
      { title: "Create a Gentle Daily Ritual", type: "gratitude" },
      { title: "Recognize Personal Needs", type: "journal" },
      { title: "Explore Supportive Connections", type: "ai_conversation" },
      { title: "Handle Difficult Dates and Reminders", type: "journal" },
      { title: "Practice Self-Compassion", type: "meditation" },
      { title: "Choose a Helpful Next Step", type: "journal" },
    ],
  },
  {
    slug: "exam-performance-anxiety",
    title: "Exam & Performance Anxiety",
    category: "Anxiety",
    tags: ["Anxiety", "Focus", "Confidence"],
    shortDescription:
      "Prepare for demanding moments with practical planning and confidence-building exercises.",
    introduction:
      "Separate preparation from worry, build realistic plans, and practice calm routines for exams, interviews, or presentations.",
    goals: [
      "Separate preparation from worry",
      "Break work into manageable steps",
      "Plan a pre-event routine",
      "Recover after setbacks",
    ],
    whoItsFor:
      "Students and professionals facing exams, interviews, talks, or performance pressure.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "blue",
    icon: "clipboardCheck",
    keywords: ["exam", "performance", "interview", "presentation", "test"],
    primaryGoal: "reduce_anxiety",
    defaultActivities: ["journaling", "breathing", "ai_conversations"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Identify the Upcoming Challenge", type: "journal" },
      { title: "Separate Preparation From Worry", type: "journal" },
      { title: "Break Work Into Manageable Steps", type: "journal" },
      { title: "Create a Realistic Preparation Plan", type: "journal" },
      { title: "Practice Gentle Grounding", type: "breathing" },
      { title: "Rehearse a Difficult Moment", type: "ai_conversation" },
      { title: "Respond to Fear of Failure", type: "journal" },
      { title: "Plan a Pre-Event Routine", type: "mindfulness" },
      { title: "Practice Recovery After a Setback", type: "gratitude" },
      { title: "Review What Helped", type: "journal" },
    ],
  },
  {
    slug: "social-anxiety",
    title: "Social Anxiety & Confidence",
    category: "Confidence",
    tags: ["Confidence", "Anxiety", "Relationships"],
    shortDescription:
      "Build confidence in social situations through manageable, user-chosen steps.",
    introduction:
      "Choose your own pace for social goals—never forced exposure—while practicing kinder predictions about social moments.",
    goals: [
      "Identify difficult social situations",
      "Separate evidence from assumptions",
      "Set a small social goal",
      "Reflect without harsh self-criticism",
    ],
    whoItsFor:
      "People who feel tense in social settings and want optional, gradual confidence practice.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "blush",
    icon: "messageCircle",
    keywords: ["social anxiety", "shy", "conversation", "confidence", "social"],
    primaryGoal: "build_confidence",
    defaultActivities: ["journaling", "breathing", "ai_conversations"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Identify a Social Situation That Feels Difficult", type: "journal" },
      { title: "Notice Predictions About Other People's Reactions", type: "journal" },
      { title: "Separate Evidence From Assumptions", type: "journal" },
      { title: "Practice a Conversation Starter", type: "ai_conversation" },
      { title: "Set a Small Social Goal", type: "journal" },
      { title: "Reflect on a Previous Social Experience", type: "journal" },
      { title: "Practice Attention Outside Self-Monitoring", type: "mindfulness" },
      { title: "Plan a Manageable Social Interaction", type: "journal" },
      { title: "Reflect Without Harsh Self-Criticism", type: "gratitude" },
      { title: "Review Personal Progress", type: "mood_checkin" },
    ],
  },
  {
    slug: "anger-frustration",
    title: "Anger Management",
    category: "Emotional Wellbeing",
    tags: ["Emotional Wellbeing", "Stress"],
    shortDescription:
      "Understand anger, spot triggers early, pause, and practice healthier responses.",
    introduction:
      "Anger is a normal emotion. This free pathway helps you understand it, recognize warning signs, pause before reacting, regulate your body, reframe unhelpful thoughts, communicate assertively, and repair when needed — without suppressing how you feel. You preview and start the plan yourself; an active plan is never overwritten automatically.",
    goals: [
      "Understand anger without shame",
      "Map triggers and body warning signs",
      "Pause and regulate before reacting",
      "Communicate assertively and repair thoughtfully",
    ],
    whoItsFor:
      "Adults who want practical skills for frustration and anger — not a clinical treatment program.",
    suggestedDurationDays: 21,
    estimatedMinutesPerDay: "5–12 min/day",
    accent: "peach",
    icon: "flame",
    keywords: [
      "anger",
      "anger management",
      "frustration",
      "irritation",
      "temper",
      "triggers",
      "boundaries",
      "pause",
    ],
    primaryGoal: "reduce_stress",
    defaultActivities: ["breathing", "journaling", "mindfulness", "walking"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      // Stage: understand anger
      {
        title: "Understand Anger — What It Protects",
        type: "journal",
      },
      // Stage: recognize triggers and warning signs
      {
        title: "Trigger Mapping (no private details required)",
        type: "journal",
      },
      {
        title: "Body-Signal Check-In",
        type: "mood_checkin",
      },
      // Stage: pause before reacting
      {
        title: "Timed Pause Before Reacting",
        type: "breathing",
      },
      // Stage: regulate body and emotions
      {
        title: "Guided Breathing — Longer Comfortable Exhale",
        type: "breathing",
      },
      {
        title: "Grounding When Frustration Rises",
        type: "mindfulness",
      },
      {
        title: "Safe Time-Out Plan",
        type: "journal",
      },
      // Stage: reframe unhelpful thoughts
      {
        title: "Thought Reframing Practice",
        type: "journal",
      },
      // Stage: communicate assertively
      {
        title: "I-Statement Practice",
        type: "ai_conversation",
      },
      {
        title: "Listening Practice Reflection",
        type: "journal",
      },
      // Stage: solve recurring problems
      {
        title: "Problem-Solving One Recurring Trigger",
        type: "journal",
      },
      // Stage: repair relationships and reflect
      {
        title: "Anger Journal — Reflect Without Shame",
        type: "journal",
      },
      {
        title: "Gentle Movement / Stretch Reset",
        type: "walk",
      },
      {
        title: "Calming Audio or Quiet Sit",
        type: "meditation",
      },
      // Stage: maintain progress
      {
        title: "Weekly Reflection — What Helped",
        type: "gratitude",
      },
    ],
    safetyNotes:
      "Anger is normal; the goal is healthier responses, not suppressing feelings. Soul Discovery does not diagnose, promise outcomes, or replace therapy, and it is not an emergency service. If you fear you may harm yourself or someone else: move away from the conflict and from dangerous objects if it is safe to do so, contact a trusted person, and seek urgent local emergency or professional support. Breathing and grounding are not enough when danger is imminent — get real-world help first.",
  },
  {
    slug: "relationship-stress",
    title: "Relationship Stress",
    category: "Relationships",
    tags: ["Relationships", "Stress"],
    shortDescription:
      "Reflect on communication, emotional needs and healthy boundaries.",
    introduction:
      "Explore needs and communication patterns while prioritizing safety. This plan does not assume every relationship should continue.",
    goals: [
      "Name emotions and needs",
      "Practice clearer communication",
      "Explore personal boundaries",
      "Identify supportive patterns",
    ],
    whoItsFor:
      "People navigating relationship tension who want reflective, non-prescriptive support.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "blush",
    icon: "heartCrack",
    keywords: ["relationship", "partner", "communication", "boundaries", "conflict"],
    primaryGoal: "reduce_stress",
    defaultActivities: ["journaling", "ai_conversations", "mindfulness"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Identify a Relationship Concern", type: "journal" },
      { title: "Name the Emotion and Need", type: "mood_checkin" },
      { title: "Separate Facts From Assumptions", type: "journal" },
      { title: "Practice Clear Communication", type: "ai_conversation" },
      { title: "Explore Personal Boundaries", type: "journal" },
      { title: "Plan a Calm Conversation", type: "journal" },
      { title: "Reflect on Listening and Understanding", type: "mindfulness" },
      { title: "Recognize Supportive Relationship Patterns", type: "gratitude" },
      { title: "Identify Trusted Sources of Support", type: "journal" },
      { title: "Choose a Healthy Next Step", type: "journal" },
    ],
    safetyNotes:
      "If abuse or coercion may be present, prioritize safety and specialist support.",
  },
  {
    slug: "focus-mental-clarity",
    title: "Focus & Mental Clarity",
    category: "Focus",
    tags: ["Focus", "Personal Growth"],
    shortDescription:
      "Reduce distractions and create a more manageable approach to everyday tasks.",
    introduction:
      "Clarify priorities, reduce one distraction at a time, and build sustainable focus—without diagnosing attention disorders.",
    goals: [
      "Identify the main priority",
      "Reduce one distraction",
      "Try short focus sessions",
      "Build a sustainable focus routine",
    ],
    whoItsFor:
      "People who feel scattered and want a gentler, realistic focus practice.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "mint",
    icon: "target",
    keywords: ["focus", "clarity", "productivity", "distraction", "attention"],
    primaryGoal: "increase_focus",
    defaultActivities: ["mindfulness", "journaling", "meditation"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Identify the Main Priority", type: "journal" },
      { title: "Choose One Manageable Task", type: "journal" },
      { title: "Reduce One Distraction", type: "journal" },
      { title: "Try a Short Focus Session", type: "meditation" },
      { title: "Take a Restorative Break", type: "walk" },
      { title: "Break a Large Task Into Smaller Steps", type: "journal" },
      { title: "Create a Simple Daily Plan", type: "journal" },
      { title: "Reflect on Energy and Concentration", type: "mood_checkin" },
      { title: "Adjust Expectations", type: "gratitude" },
      { title: "Build a Sustainable Focus Routine", type: "mindfulness" },
    ],
  },
  {
    slug: "healthy-habits-motivation",
    title: "Healthy Habits & Motivation",
    category: "Personal Growth",
    tags: ["Personal Growth", "Mood"],
    shortDescription:
      "Build realistic routines and celebrate small steps toward personal wellbeing.",
    introduction:
      "Choose one wellbeing goal, keep the first step tiny, and recover from missed days without shame.",
    goals: [
      "Choose one personal wellbeing goal",
      "Make the first step small",
      "Plan for common obstacles",
      "Celebrate small wins",
    ],
    whoItsFor:
      "Anyone wanting steadier habits without rigid productivity pressure.",
    suggestedDurationDays: 14,
    estimatedMinutesPerDay: "5–10 min/day",
    accent: "mint",
    icon: "sprout",
    keywords: ["habits", "motivation", "routine", "goals", "consistency"],
    primaryGoal: "improve_mood",
    defaultActivities: ["gratitude", "walking", "journaling"],
    defaultDailyTime: "10_minutes",
    activityOutline: [
      { title: "Choose One Personal Wellbeing Goal", type: "journal" },
      { title: "Make the First Step Small", type: "journal" },
      { title: "Connect a Habit to an Existing Routine", type: "journal" },
      { title: "Plan for Common Obstacles", type: "journal" },
      { title: "Track an Achievable Action", type: "mood_checkin" },
      { title: "Reflect on What Supports Motivation", type: "gratitude" },
      { title: "Adjust an Overly Difficult Goal", type: "journal" },
      { title: "Recognize Small Wins", type: "gratitude" },
      { title: "Plan for Missed Days Without Shame", type: "mindfulness" },
      { title: "Build a Sustainable Maintenance Routine", type: "walk" },
    ],
  },
];

/** Primary filter chips shown in the hub (matches approved dashboard screenshot). */
export const PLAN_CATEGORIES = [
  "All",
  "Anxiety",
  "Mood",
  "Sleep",
  "Stress",
  "More",
] as const;

/** Secondary categories under the "More" dropdown. */
export const MORE_CATEGORIES = [
  "Confidence",
  "Relationships",
  "Focus",
  "Personal Growth",
  "Emotional Wellbeing",
  "Immediate Support",
] as const;

export function getPlanBySlug(slug: string): CatalogPlan | undefined {
  return WELLNESS_PLAN_CATALOG.find((p) => p.slug === slug);
}

export function filterCatalogPlans(opts: {
  query?: string;
  category?: string;
}): CatalogPlan[] {
  const q = (opts.query || "").trim().toLowerCase();
  const category = opts.category || "All";

  return WELLNESS_PLAN_CATALOG.filter((plan) => {
    const matchesCategory =
      category === "All" ||
      plan.category === category ||
      plan.tags.includes(category as CatalogPlan["category"]) ||
      (category === "More" &&
        MORE_CATEGORIES.includes(
          plan.category as (typeof MORE_CATEGORIES)[number]
        ));

    if (!matchesCategory) return false;
    if (!q) return true;

    const haystack = [
      plan.title,
      plan.shortDescription,
      plan.introduction,
      plan.category,
      ...plan.tags,
      ...plan.keywords,
      ...plan.goals,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function suggestPlansForMood(
  mood: "anxious" | "overwhelmed" | "low" | "restless" | "okay"
): string[] {
  switch (mood) {
    case "anxious":
      return ["reduce-anxiety", "panic-support"];
    case "overwhelmed":
      return ["stress-burnout", "emotional-balance"];
    case "low":
      return ["lift-your-mood", "healthy-habits-motivation"];
    case "restless":
      return ["sleep-better", "focus-mental-clarity"];
    case "okay":
      return ["focus-mental-clarity", "healthy-habits-motivation"];
    default:
      return [];
  }
}
