import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Lock, LogOut, Menu, X, Book, ClipboardList, Award, Home, Settings, AlertCircle, Check, BarChart3 } from 'lucide-react';

const EmployeePortal = () => {
  // ==================== MOCK DATA ====================
  const mockUsers = {
    'john.doe': { password: 'password123', name: 'John Doe', role: 'VMA', dept: 'Clinical' },
    'sarah.smith': { password: 'password123', name: 'Sarah Smith', role: 'Billing Coordinator', dept: 'Revenue Cycle' },
    'demo': { password: 'demo', name: 'Demo User', role: 'Virtual Assistant', dept: 'Operations' }
  };

  const trainingModules = [
    {
      id: 1,
      title: 'HIPAA Compliance & Data Security',
      description: 'Learn about protecting patient information and HIPAA regulations',
      category: 'Compliance',
      duration: '2 hours',
      status: 'completed',
      content: `
        ## HIPAA Compliance Training

        ### What is PHI (Protected Health Information)?
        PHI is any health information that can identify a patient:
        - Patient names, dates of birth, social security numbers
        - Medical record numbers, insurance member IDs
        - Diagnoses, treatment plans, test results
        - Medications, allergies, immunizations
        - Payment information and insurance claims

        ### HIPAA Privacy Rule - What You Must Do
        1. Only access patient information you need for your job
        2. Never disclose patient information to anyone outside the healthcare team
        3. Do not discuss patients in public or where others can overhear
        4. Never share patient information via personal email, text, or social media
        5. Log off immediately after accessing systems
        6. Report any accidental disclosure immediately to your manager

        ### HIPAA Security Rule - Technical Safeguards
        1. Always use VPN when accessing any system
        2. Use strong passwords (minimum 12 characters)
        3. Never share your login credentials
        4. Enable two-factor authentication
        5. Encrypt your laptop
        6. Use a privacy screen when working in public
        7. Never work with PHI on public WiFi
        8. Lock your computer when stepping away

        ### Breach Notification
        If you suspect any breach:
        1. STOP all work immediately
        2. Call your manager IMMEDIATELY
        3. Document what happened
        4. Notify the Compliance Officer within 24 hours

        Penalties for violations: $100-$50,000+ per violation, criminal charges up to 10 years imprisonment.
      `,
      lessons: 5,
      completionDate: '2025-01-15'
    },
    {
      id: 2,
      title: 'CharmEHR Navigation',
      description: 'Master the CharmEHR electronic health record system',
      category: 'Systems',
      duration: '3 hours',
      status: 'in_progress',
      progress: 65,
      content: `
        ## CharmEHR Navigation Training

        ### What is CharmEHR?
        CharmEHR is Sally Health's Electronic Health Record (EHR) system containing:
        - Patient Demographics and Insurance
        - Clinical Records and Medical History
        - Visit Notes and Provider Documentation
        - Lab Results and Imaging Reports
        - Prescriptions and Medications
        - Appointment Scheduling
        - Secure Messaging

        ### Logging In
        1. Connect to VPN
        2. Navigate to https://charm.sallyhealth.com
        3. Enter username and password
        4. Complete two-factor authentication
        5. Access the dashboard

        ### Dashboard Navigation
        - Patients → Search and access patient records
        - Schedule → View provider schedules and appointments
        - Clinical → Access clinical notes and care documentation
        - Billing → Claims and revenue cycle functions
        - Messages → Secure messaging with team members
        - Reports → Practice analytics and metrics
        - Settings → Profile and preferences

        ### Finding Patient Records
        1. Click "Patients" from left menu
        2. Search by: Last name, MRN, or Date of Birth
        3. Review search results
        4. Click patient name to open record
        5. Close record when finished (IMPORTANT for security)

        ### Using Secure Messaging
        1. Click "Messages"
        2. Click "New Message"
        3. Select recipient from directory
        4. Type subject and message
        5. Click "Send"

        REMEMBER: Never use personal email for patient information. Always use secure messaging in CharmEHR.
      `,
      lessons: 8,
      completionDate: null
    },
    {
      id: 3,
      title: 'Availity Portal & Claims Processing',
      description: 'Learn how to submit claims and check eligibility using Availity',
      category: 'Billing',
      duration: '2.5 hours',
      status: 'not_started',
      progress: 0,
      content: `
        ## Availity Portal Training

        ### What is Availity?
        Availity is a healthcare clearinghouse used to:
        - Submit claims (837 files) to insurance payers
        - Check claim status
        - Request eligibility (270 inquiries)
        - Receive EOBs (Explanation of Benefits)
        - Track payments

        ### Logging Into Availity
        1. Ensure VPN is connected
        2. Navigate to https://availity.sallyhealth.com
        3. Enter your username and password
        4. Complete two-factor authentication
        5. Access the dashboard

        ### Running a 270 Eligibility Inquiry
        1. Click "Eligibility / Benefits"
        2. Click "New Eligibility Inquiry"
        3. Enter patient information (name, DOB, Member ID, Group #)
        4. Select "Real-time" for immediate response
        5. Select service type (30=Health, 35=Dental, 40=Vision)
        6. Click "Submit"
        7. Review 271 response with eligibility details

        ### Checking Claim Status
        1. Click "Claims Management"
        2. Click "Check Claim Status"
        3. Search by patient name, MRN, claim ID, or submission ID
        4. Review status (Submitted, Accepted, Denied, Rejected, Paid)
        5. For denials, click to see reason

        ### Understanding Claim Responses
        - Submitted: Claim received by payer
        - Accepted: Payer accepted claim
        - Denied: Payer denied claim
        - Rejected: Claim had format error
        - Paid/EOB: Payment received
      `,
      lessons: 6,
      completionDate: null
    },
    {
      id: 4,
      title: 'Patient Communication & Scheduling',
      description: 'Professional patient communication and appointment scheduling procedures',
      category: 'Clinical',
      duration: '2 hours',
      status: 'not_started',
      progress: 0,
      content: `
        ## Patient Communication Training

        ### Calling Patients to Schedule Appointments

        **Step 1: Preparation**
        - Pull up patient record in CharmEHR
        - Verify phone number and preferred contact method
        - Check provider availability
        - Have calendar ready

        **Step 2: Professional Greeting**
        "Hi [Patient Name], this is [Your Name] calling from Sally Health. Do you have a few minutes to talk about scheduling an appointment?"

        **Step 3: Confirm Identity**
        "To confirm I have the right person, can I verify your date of birth?"

        **Step 4: Discuss Needs**
        "What type of appointment are you looking for?"
        "How soon do you need to be seen?"
        "What days/times work best for you?"

        **Step 5: Offer Options**
        "Dr. Smith has availability Tuesday at 2 PM or Thursday at 10 AM. Which works better?"

        **Step 6: Confirm & Provide Details**
        "So I have you scheduled for Tuesday, June 15th at 2 PM with Dr. Smith. Please arrive 15 minutes early and bring your insurance card and photo ID."

        **Step 7: Close Professionally**
        "Thank you for choosing Sally Health. We look forward to seeing you."

        ### Confirming Appointments (24-48 Hours Before)
        "Hi [Name], this is [Your Name] calling to confirm your appointment tomorrow at 2 PM with Dr. Smith. Does that still work for you?"

        If rescheduling needed: Help find alternative time

        ### Following Up After Visit
        "Hi [Name], I wanted to check in on how you're doing after your visit with Dr. Smith."
        "Are you having any concerns?"
        "Dr. Smith recommended that you..."
      `,
      lessons: 4,
      completionDate: null
    }
  ];

  const quizzes = [
    {
      id: 1,
      moduleId: 1,
      title: 'HIPAA Compliance Quiz',
      questions: [
        {
          id: 1,
          question: 'What are three examples of PHI (Protected Health Information)?',
          type: 'multiple_choice',
          options: [
            'Patient name, medical record number, diagnosis',
            'Patient address, weather, favorite color',
            'Patient insurance ID, book preferences, height',
            'Patient phone number, zip code, employer'
          ],
          correct: 0,
          explanation: 'PHI includes any health information that identifies a patient, such as name, MRN, and diagnoses.'
        },
        {
          id: 2,
          question: 'Who should you contact if you suspect a HIPAA breach?',
          type: 'multiple_choice',
          options: [
            'Your coworker',
            'Your manager immediately',
            'Wait and report at your next review',
            'Only if it seems serious'
          ],
          correct: 1,
          explanation: 'You must contact your manager immediately when you suspect a breach - do not wait.'
        },
        {
          id: 3,
          question: 'Can you discuss patient information in a private conversation with a family member?',
          type: 'true_false',
          correct: false,
          explanation: 'No, you cannot discuss patient information with anyone outside the healthcare team, regardless of privacy.'
        },
        {
          id: 4,
          question: 'What is the minimum password length required?',
          type: 'multiple_choice',
          options: [
            '8 characters',
            '10 characters',
            '12 characters',
            '15 characters'
          ],
          correct: 2,
          explanation: 'Minimum 12 characters with uppercase, lowercase, numbers, and symbols.'
        },
        {
          id: 5,
          question: 'True or False: You must always use VPN when accessing Sally Health systems remotely.',
          type: 'true_false',
          correct: true,
          explanation: 'VPN is required for ALL remote access to Sally Health systems - no exceptions.'
        }
      ],
      passingScore: 80,
      timeLimit: 30,
      status: 'completed',
      userScore: 100,
      completionDate: '2025-01-15'
    },
    {
      id: 2,
      moduleId: 2,
      title: 'CharmEHR Navigation Quiz',
      questions: [
        {
          id: 1,
          question: 'What are the first three steps to log into CharmEHR?',
          type: 'multiple_choice',
          options: [
            'Connect to VPN, open browser, enter credentials',
            'Open browser, connect to VPN, enter credentials',
            'Enter credentials, connect to VPN, open browser',
            'Open browser, enter credentials, connect to VPN'
          ],
          correct: 0,
          explanation: 'You must connect to VPN FIRST before accessing any Sally Health systems.'
        },
        {
          id: 2,
          question: 'When should you close a patient record in CharmEHR?',
          type: 'multiple_choice',
          options: [
            'At the end of your shift',
            'Immediately after accessing it',
            'When you open another patient',
            'Every hour'
          ],
          correct: 1,
          explanation: 'Close patient records immediately after accessing them - this is a critical security protocol.'
        },
        {
          id: 3,
          question: 'Which menu option allows you to send secure messages to colleagues?',
          type: 'multiple_choice',
          options: [
            'Patients',
            'Schedule',
            'Messages',
            'Billing'
          ],
          correct: 2,
          explanation: 'Use the Messages section for all secure communications about patients.'
        },
        {
          id: 4,
          question: 'True or False: You can discuss patient information via email to team members.',
          type: 'true_false',
          correct: false,
          explanation: 'Use only secure messaging in CharmEHR for patient communications - never personal email.'
        }
      ],
      passingScore: 75,
      timeLimit: 25,
      status: 'in_progress',
      userScore: null,
      completionDate: null
    },
    {
      id: 3,
      moduleId: 3,
      title: 'Availity & Claims Quiz',
      questions: [
        {
          id: 1,
          question: 'What does a 270 inquiry request from an insurance company?',
          type: 'multiple_choice',
          options: [
            'Patient eligibility and benefits information',
            'Claim payment status',
            'Billing address',
            'Provider credentials'
          ],
          correct: 0,
          explanation: 'A 270 is an eligibility inquiry asking the insurance if the patient has coverage.'
        },
        {
          id: 2,
          question: 'What is the expected response time for a real-time 270 inquiry?',
          type: 'multiple_choice',
          options: [
            '5-10 minutes',
            '5-30 seconds',
            '1-2 hours',
            '24 hours'
          ],
          correct: 1,
          explanation: 'Real-time 270 inquiries typically receive response within 5-30 seconds.'
        },
        {
          id: 3,
          question: 'What does claim status "Denied" mean?',
          type: 'multiple_choice',
          options: [
            'Message received but not yet processed',
            'Insurance company rejected the claim',
            'Format error in the claim',
            'Payment was received'
          ],
          correct: 1,
          explanation: 'Denied means the insurance company reviewed the claim and declined to pay it.'
        }
      ],
      passingScore: 70,
      timeLimit: 20,
      status: 'not_started',
      userScore: null,
      completionDate: null
    }
  ];

  const practices = [
    {
      id: 1,
      title: 'CharmEHR Practice Exercise',
      description: 'Practice navigating CharmEHR with a test patient',
      moduleId: 2,
      type: 'interactive',
      status: 'available',
      attempts: 0,
      bestScore: null,
      tasks: [
        'Log into CharmEHR',
        'Search for patient "John Smith" by last name',
        'Open the patient record',
        'Navigate to the Demographics tab',
        'Find the patient\'s insurance member ID',
        'Close the patient record',
        'Send a secure message to your trainer'
      ]
    },
    {
      id: 2,
      title: 'Availity Practice - 270 Inquiry',
      description: 'Practice running a 270 eligibility inquiry',
      moduleId: 3,
      type: 'interactive',
      status: 'available',
      attempts: 0,
      bestScore: null,
      tasks: [
        'Log into Availity',
        'Navigate to Eligibility section',
        'Submit a 270 inquiry for a test patient',
        'Review the 271 response',
        'Identify the deductible amount',
        'Check copay for office visit',
        'Document findings'
      ]
    }
  ];

  const todos = [
    { id: 1, title: 'Complete HIPAA Compliance Training', dueDate: '2025-01-20', priority: 'high', category: 'Training', completed: false },
    { id: 2, title: 'Pass HIPAA Quiz (80% or higher)', dueDate: '2025-01-22', priority: 'high', category: 'Training', completed: false },
    { id: 3, title: 'Complete CharmEHR Navigation Training', dueDate: '2025-01-30', priority: 'high', category: 'Training', completed: false },
    { id: 4, title: 'Complete CharmEHR Practice Exercise', dueDate: '2025-02-05', priority: 'medium', category: 'Practice', completed: false },
    { id: 5, title: 'Review Availity Portal Documentation', dueDate: '2025-02-10', priority: 'medium', category: 'Training', completed: false },
    { id: 6, title: 'Schedule 1:1 Training Session with Manager', dueDate: '2025-02-15', priority: 'medium', category: 'Meeting', completed: false }
  ];

  // ==================== STATE MANAGEMENT ====================
  const [currentUser, setCurrentUser] = useState(null);
  const [loginUsername, setLoginUsername] = useState('demo');
  const [loginPassword, setLoginPassword] = useState('demo');
  const [loginError, setLoginError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userTodos, setUserTodos] = useState(todos);
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  // ==================== AUTHENTICATION ====================
  const handleLogin = () => {
    setLoginError('');
    const user = mockUsers[loginUsername.toLowerCase()];
    if (user && user.password === loginPassword) {
      setCurrentUser({ username: loginUsername, ...user });
      setCurrentPage('dashboard');
    } else {
      setLoginError('Invalid username or password. Try demo/demo');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUsername('demo');
    setLoginPassword('demo');
    setCurrentPage('dashboard');
  };

  // ==================== QUIZ HANDLING ====================
  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answer });
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
  };

  const getQuizScore = () => {
    const quiz = selectedQuiz;
    let score = 0;
    quiz.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correct) {
        score++;
      }
    });
    return Math.round((score / quiz.questions.length) * 100);
  };

  // ==================== TODO HANDLING ====================
  const toggleTodoComplete = (id) => {
    setUserTodos(userTodos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setUserTodos(userTodos.filter(todo => todo.id !== id));
  };

  const addTodo = () => {
    if (newTodoTitle.trim()) {
      const newTodo = {
        id: Math.max(...userTodos.map(t => t.id), 0) + 1,
        title: newTodoTitle,
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'medium',
        category: 'Other',
        completed: false
      };
      setUserTodos([...userTodos, newTodo]);
      setNewTodoTitle('');
      setShowAddTodo(false);
    }
  };

  // ==================== STATS CALCULATIONS ====================
  const getCompletionStats = () => {
    const completed = trainingModules.filter(m => m.status === 'completed').length;
    const inProgress = trainingModules.filter(m => m.status === 'in_progress').length;
    const notStarted = trainingModules.filter(m => m.status === 'not_started').length;
    const completedQuizzes = quizzes.filter(q => q.status === 'completed').length;
    const totalTodos = userTodos.length;
    const completedTodos = userTodos.filter(t => t.completed).length;

    return {
      completionPercentage: Math.round((completed / trainingModules.length) * 100),
      completed,
      inProgress,
      notStarted,
      completedQuizzes,
      totalQuizzes: quizzes.length,
      completedTodos,
      totalTodos
    };
  };

  // ==================== LOGIN SCREEN ====================
  if (!currentUser) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' }} className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Sally Health</h1>
            <p className="text-gray-600">Employee Training Portal</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Login
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2"><strong>Demo Account:</strong></p>
            <p className="text-sm text-gray-600">Username: <code className="bg-white px-2 py-1 rounded">demo</code></p>
            <p className="text-sm text-gray-600">Password: <code className="bg-white px-2 py-1 rounded">demo</code></p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN APPLICATION ====================
  const stats = getCompletionStats();

  return (
    <div style={{ background: '#f8fafc' }} className="min-h-screen flex">
      {/* SIDEBAR */}
      <div
        style={{
          background: '#1f2937',
          width: sidebarOpen ? '280px' : '0px',
          transition: 'width 0.3s ease'
        }}
        className="text-white overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">Sally Health</h2>
              <p className="text-gray-400 text-xs mt-1">Training Portal</p>
            </div>
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="p-6 border-b border-gray-700">
          <p className="text-sm text-gray-400">Welcome</p>
          <p className="font-semibold text-lg">{currentUser.name}</p>
          <p className="text-sm text-gray-400">{currentUser.role}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setCurrentPage('dashboard')}
            style={{ background: currentPage === 'dashboard' ? '#374151' : 'transparent' }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 flex gap-3 items-center transition"
          >
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentPage('training')}
            style={{ background: currentPage === 'training' ? '#374151' : 'transparent' }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 flex gap-3 items-center transition"
          >
            <Book size={18} />
            <span>Training Modules</span>
          </button>

          <button
            onClick={() => setCurrentPage('quizzes')}
            style={{ background: currentPage === 'quizzes' ? '#374151' : 'transparent' }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 flex gap-3 items-center transition"
          >
            <Award size={18} />
            <span>Quizzes & Tests</span>
          </button>

          <button
            onClick={() => setCurrentPage('todos')}
            style={{ background: currentPage === 'todos' ? '#374151' : 'transparent' }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 flex gap-3 items-center transition"
          >
            <ClipboardList size={18} />
            <span>Todo Checklist</span>
          </button>

          <button
            onClick={() => setCurrentPage('progress')}
            style={{ background: currentPage === 'progress' ? '#374151' : 'transparent' }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 flex gap-3 items-center transition"
          >
            <BarChart3 size={18} />
            <span>Progress & Reports</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex gap-2 items-center justify-center transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1">
        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1 ml-4">
            {currentPage === 'dashboard' && 'Dashboard'}
            {currentPage === 'training' && 'Training Modules'}
            {currentPage === 'quizzes' && 'Quizzes & Tests'}
            {currentPage === 'todos' && 'Todo Checklist'}
            {currentPage === 'progress' && 'Progress & Reports'}
          </h1>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-6 max-w-7xl mx-auto">
          {/* DASHBOARD PAGE */}
          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              {/* PROGRESS OVERVIEW */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Completion Rate</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.completionPercentage}%</p>
                    </div>
                    <div className="text-4xl text-blue-500">📊</div>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">{stats.completed} of {trainingModules.length} modules</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Quizzes Passed</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.completedQuizzes}/{stats.totalQuizzes}</p>
                    </div>
                    <div className="text-4xl text-green-500">✅</div>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">All required quizzes</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Tasks Completed</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.completedTodos}/{stats.totalTodos}</p>
                    </div>
                    <div className="text-4xl text-purple-500">✓</div>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">Onboarding checklist</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Current Focus</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
                    </div>
                    <div className="text-4xl text-yellow-500">📚</div>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">In progress modules</p>
                </div>
              </div>

              {/* QUICK START */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RECENT TRAINING */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Training Modules</h2>
                  <div className="space-y-3">
                    {trainingModules.slice(0, 3).map(module => (
                      <div key={module.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        {module.status === 'completed' && <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-1" />}
                        {module.status === 'in_progress' && <Circle size={20} className="text-yellow-500 flex-shrink-0 mt-1" />}
                        {module.status === 'not_started' && <Lock size={20} className="text-gray-400 flex-shrink-0 mt-1" />}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{module.title}</p>
                          <p className="text-sm text-gray-600">{module.duration}</p>
                          {module.progress && (
                            <div className="mt-2 bg-gray-200 rounded-full h-2">
                              <div
                                style={{ width: `${module.progress}%`, background: '#3b82f6' }}
                                className="h-2 rounded-full transition-all"
                              />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedModule(module);
                            setCurrentPage('training');
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* UPCOMING DEADLINES */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Deadlines</h2>
                  <div className="space-y-3">
                    {userTodos
                      .filter(t => !t.completed)
                      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                      .slice(0, 4)
                      .map(todo => (
                        <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-l-4"
                          style={{
                            borderLeftColor: todo.priority === 'high' ? '#ef4444' : todo.priority === 'medium' ? '#f59e0b' : '#10b981'
                          }}>
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodoComplete(todo.id)}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{todo.title}</p>
                            <p className="text-sm text-gray-600">Due: {new Date(todo.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* NEXT STEPS */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-bold text-blue-900 mb-3">🎯 Next Steps</h2>
                <ul className="space-y-2 text-blue-900">
                  {stats.inProgress === 0 && stats.completed === trainingModules.length ? (
                    <li>✅ Congratulations! You've completed all training modules.</li>
                  ) : (
                    <>
                      {trainingModules.filter(m => m.status === 'in_progress').length > 0 && (
                        <li>📚 Continue with: <strong>{trainingModules.find(m => m.status === 'in_progress')?.title}</strong></li>
                      )}
                      {quizzes.some(q => q.status === 'not_started') && (
                        <li>📝 Complete pending quizzes for modules you've finished</li>
                      )}
                      {userTodos.filter(t => !t.completed).length > 0 && (
                        <li>✓ Check off items in your Todo Checklist</li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* TRAINING MODULES PAGE */}
          {currentPage === 'training' && !selectedModule && (
            <div className="space-y-4">
              {trainingModules.map(module => (
                <div
                  key={module.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                  onClick={() => setSelectedModule(module)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">
                      {module.status === 'completed' && '✅'}
                      {module.status === 'in_progress' && '📚'}
                      {module.status === 'not_started' && '🔒'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {module.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{module.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>📖 {module.lessons} lessons</span>
                        <span>⏱️ {module.duration}</span>
                        {module.status === 'completed' && module.completionDate && (
                          <span className="text-green-600">✓ Completed {new Date(module.completionDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      {module.progress && (
                        <div className="mt-3 bg-gray-200 rounded-full h-2">
                          <div
                            style={{ width: `${module.progress}%`, background: '#3b82f6' }}
                            className="h-2 rounded-full transition-all"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModule(module);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                    >
                      {module.status === 'completed' ? 'Review' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODULE DETAIL PAGE */}
          {currentPage === 'training' && selectedModule && (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedModule(null)}
                className="text-blue-600 hover:text-blue-700 font-medium mb-4"
              >
                ← Back to Modules
              </button>

              <div className="bg-white rounded-lg shadow p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">
                    {selectedModule.status === 'completed' ? '✅' : '📚'}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedModule.title}</h2>
                    <p className="text-gray-600 mt-1">{selectedModule.duration} • {selectedModule.lessons} lessons</p>
                  </div>
                </div>

                {selectedModule.progress && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700">Progress</span>
                      <span className="font-medium">{selectedModule.progress}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        style={{ width: `${selectedModule.progress}%`, background: '#3b82f6' }}
                        className="h-3 rounded-full transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="prose max-w-none">
                  {selectedModule.content.split('\n').map((line, idx) => (
                    line.startsWith('#') ? (
                      <h3 key={idx} className="text-lg font-bold text-gray-900 mt-4 mb-2">{line.replace('#', '').trim()}</h3>
                    ) : line.startsWith('-') || line.startsWith('•') ? (
                      <li key={idx} className="text-gray-700 ml-4">{line.replace('-', '').replace('•', '').trim()}</li>
                    ) : line.trim() === '' ? (
                      <br key={idx} />
                    ) : (
                      <p key={idx} className="text-gray-700 my-2">{line}</p>
                    )
                  ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-900 font-medium">📝 Next Step:</p>
                  <p className="text-blue-800 mt-1">
                    {selectedModule.status === 'not_started' ? 'Start reading the training material above.' : 'Take the quiz to test your knowledge!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* QUIZZES PAGE */}
          {currentPage === 'quizzes' && !selectedQuiz && (
            <div className="space-y-4">
              {quizzes.map(quiz => {
                const module = trainingModules.find(m => m.id === quiz.moduleId);
                return (
                  <div
                    key={quiz.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">
                        {quiz.status === 'completed' ? '✅' : quiz.status === 'in_progress' ? '📝' : '🔒'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{quiz.title}</h3>
                        <p className="text-gray-600 mb-3">Module: <span className="font-medium">{module?.title}</span></p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span>📊 {quiz.questions.length} questions</span>
                          <span>⏱️ {quiz.timeLimit} minutes</span>
                          <span>✅ Pass: {quiz.passingScore}%</span>
                          {quiz.status === 'completed' && quiz.userScore && (
                            <span className="text-green-600 font-medium">Score: {quiz.userScore}%</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                      >
                        {quiz.status === 'completed' ? 'Retake' : 'Start'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* QUIZ DETAIL PAGE */}
          {currentPage === 'quizzes' && selectedQuiz && (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setSelectedQuiz(null);
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium mb-4"
              >
                ← Back to Quizzes
              </button>

              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedQuiz.title}</h2>
                <p className="text-gray-600 mb-6">
                  {selectedQuiz.questions.length} questions • {selectedQuiz.timeLimit} minute limit • Pass: {selectedQuiz.passingScore}%
                </p>

                {!quizSubmitted ? (
                  <div className="space-y-8">
                    {selectedQuiz.questions.map((question, idx) => (
                      <div key={question.id} className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          {idx + 1}. {question.question}
                        </h3>

                        {question.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            {question.options.map((option, optIdx) => (
                              <label key={optIdx} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-blue-50"
                                style={{
                                  borderColor: quizAnswers[question.id] === optIdx ? '#3b82f6' : '#e5e7eb',
                                  background: quizAnswers[question.id] === optIdx ? '#eff6ff' : 'white'
                                }}>
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  checked={quizAnswers[question.id] === optIdx}
                                  onChange={() => handleQuizAnswer(question.id, optIdx)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="ml-3 text-gray-900">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === 'true_false' && (
                          <div className="space-y-2">
                            {['True', 'False'].map((value, idx) => (
                              <label key={idx} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-blue-50"
                                style={{
                                  borderColor: quizAnswers[question.id] === (idx === 0) ? '#3b82f6' : '#e5e7eb',
                                  background: quizAnswers[question.id] === (idx === 0) ? '#eff6ff' : 'white'
                                }}>
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  checked={quizAnswers[question.id] === (idx === 0)}
                                  onChange={() => handleQuizAnswer(question.id, idx === 0)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="ml-3 text-gray-900">{value}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length < selectedQuiz.questions.length}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
                    >
                      Submit Quiz
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div style={{
                      background: getQuizScore() >= selectedQuiz.passingScore ? '#dcfce7' : '#fee2e2',
                      border: `2px solid ${getQuizScore() >= selectedQuiz.passingScore ? '#16a34a' : '#ef4444'}`
                    }} className="rounded-lg p-8 text-center">
                      <p className="text-6xl mb-4">
                        {getQuizScore() >= selectedQuiz.passingScore ? '🎉' : '📚'}
                      </p>
                      <h3 className="text-3xl font-bold mb-2"
                        style={{ color: getQuizScore() >= selectedQuiz.passingScore ? '#16a34a' : '#ef4444' }}>
                        {getQuizScore() >= selectedQuiz.passingScore ? 'Quiz Passed!' : 'Quiz Failed'}
                      </h3>
                      <p className="text-2xl font-bold mb-4">Score: {getQuizScore()}%</p>
                      <p style={{ color: getQuizScore() >= selectedQuiz.passingScore ? '#16a34a' : '#ef4444' }}>
                        Passing score: {selectedQuiz.passingScore}%
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Review Answers</h3>
                      {selectedQuiz.questions.map((question, idx) => {
                        const isCorrect = quizAnswers[question.id] === question.correct;
                        return (
                          <div key={question.id} className={`p-4 rounded-lg border-2 ${
                            isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                          }`}>
                            <div className="flex items-start gap-3 mb-2">
                              {isCorrect ? (
                                <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-1" />
                              ) : (
                                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-1" />
                              )}
                              <div>
                                <p className="font-bold text-gray-900">{idx + 1}. {question.question}</p>
                                <p className={`text-sm mt-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                  {question.explanation}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedQuiz(null);
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                    >
                      Back to Quizzes
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TODOS PAGE */}
          {currentPage === 'todos' && (
            <div className="space-y-6">
              <button
                onClick={() => setShowAddTodo(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                + Add New Todo
              </button>

              {showAddTodo && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Task</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      placeholder="Enter task title"
                      onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addTodo}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                      >
                        Add Task
                      </button>
                      <button
                        onClick={() => setShowAddTodo(false)}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STATS */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <p className="text-gray-600 text-sm">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalTodos}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <p className="text-gray-600 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedTodos}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <p className="text-gray-600 text-sm">Remaining</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.totalTodos - stats.completedTodos}</p>
                </div>
              </div>

              {/* TODOS BY CATEGORY */}
              {['Training', 'Practice', 'Meeting', 'Other'].map(category => {
                const categoryTodos = userTodos.filter(t => t.category === category);
                if (categoryTodos.length === 0) return null;

                return (
                  <div key={category} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{category}</h3>
                    <div className="space-y-3">
                      {categoryTodos.map(todo => (
                        <div
                          key={todo.id}
                          className="flex items-center gap-3 p-4 rounded-lg border-l-4 bg-gray-50"
                          style={{
                            borderLeftColor: todo.completed ? '#9ca3af' : (
                              todo.priority === 'high' ? '#ef4444' : todo.priority === 'medium' ? '#f59e0b' : '#10b981'
                            ),
                            opacity: todo.completed ? 0.6 : 1
                          }}>
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodoComplete(todo.id)}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <p className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {todo.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              Due: {new Date(todo.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {todo.priority.toUpperCase()}
                          </span>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PROGRESS PAGE */}
          {currentPage === 'progress' && (
            <div className="space-y-6">
              {/* SUMMARY */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600 mb-2">Modules Completed</p>
                  <p className="text-4xl font-bold text-green-600">{stats.completed}</p>
                  <p className="text-sm text-gray-600 mt-2">of {trainingModules.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600 mb-2">Quizzes Passed</p>
                  <p className="text-4xl font-bold text-blue-600">{stats.completedQuizzes}</p>
                  <p className="text-sm text-gray-600 mt-2">of {stats.totalQuizzes}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600 mb-2">Avg Quiz Score</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {Math.round(quizzes.filter(q => q.userScore).reduce((a, b) => a + b.userScore, 0) / Math.max(quizzes.filter(q => q.userScore).length, 1)) || '—'}%
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600 mb-2">Overall Progress</p>
                  <p className="text-4xl font-bold text-orange-600">{stats.completionPercentage}%</p>
                </div>
              </div>

              {/* DETAILED BREAKDOWN */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Training Modules Status</h2>
                <div className="space-y-4">
                  {trainingModules.map(module => (
                    <div key={module.id}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{module.title}</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          module.status === 'completed' ? 'bg-green-100 text-green-800' :
                          module.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {module.status === 'completed' ? '✓ Completed' :
                           module.status === 'in_progress' ? '⏳ In Progress' :
                           'Not Started'}
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          style={{
                            width: module.status === 'completed' ? '100%' : module.progress ? `${module.progress}%` : '0%',
                            background: module.status === 'completed' ? '#10b981' : '#3b82f6'
                          }}
                          className="h-2 rounded-full transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUIZ SCORES */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quiz Results</h2>
                <div className="space-y-4">
                  {quizzes.map(quiz => {
                    const module = trainingModules.find(m => m.id === quiz.moduleId);
                    return (
                      <div key={quiz.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{quiz.title}</p>
                          <p className="text-sm text-gray-600">{module?.title}</p>
                        </div>
                        {quiz.status === 'completed' ? (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{quiz.userScore}%</p>
                            <p className={`text-xs font-medium ${quiz.userScore >= quiz.passingScore ? 'text-green-600' : 'text-red-600'}`}>
                              {quiz.userScore >= quiz.passingScore ? '✓ Passed' : '✗ Failed'}
                            </p>
                          </div>
                        ) : quiz.status === 'in_progress' ? (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">In Progress</span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-medium">Not Started</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CERTIFICATION STATUS */}
              <div className={`rounded-lg p-6 ${
                stats.completionPercentage === 100 && stats.completedQuizzes === stats.totalQuizzes
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-blue-50 border-2 border-blue-200'
              }`}>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  {stats.completionPercentage === 100 && stats.completedQuizzes === stats.totalQuizzes ? (
                    <>🎓 Certification Complete!</>
                  ) : (
                    <>📋 Certification Progress</>
                  )}
                </h3>
                {stats.completionPercentage === 100 && stats.completedQuizzes === stats.totalQuizzes ? (
                  <p className="text-green-900">
                    ✓ You have successfully completed all training modules and quizzes. Your certification is active!
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-blue-900">Complete the following to earn your certification:</p>
                    <ul className="space-y-1 text-blue-800 text-sm">
                      <li className={stats.completionPercentage === 100 ? 'line-through text-gray-600' : ''}>
                        ✓ Complete all {trainingModules.length} training modules ({stats.completed}/{trainingModules.length})
                      </li>
                      <li className={stats.completedQuizzes === stats.totalQuizzes ? 'line-through text-gray-600' : ''}>
                        ✓ Pass all {stats.totalQuizzes} quizzes ({stats.completedQuizzes}/{stats.totalQuizzes})
                      </li>
                      <li className={stats.completedTodos === stats.totalTodos ? 'line-through text-gray-600' : ''}>
                        ✓ Complete all checklist items ({stats.completedTodos}/{stats.totalTodos})
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePortal;
