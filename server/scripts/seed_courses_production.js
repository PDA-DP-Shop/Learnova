const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const COURSES = [
  {
    title: 'Precision Web Engineering: HTML5 & CSS3 Masterclass',
    description: 'Build industrial-grade web interfaces. Master high-performance semantic structure and advanced layouts with CSS Grid and Flexbox logic.',
    tags: ['Web Engineering', 'Frontend', 'HTML & CSS'],
    price: 1999,
    coverImage: 'https://images.unsplash.com/photo-1523437113738-bbd3ee09fabf?auto=format&fit=crop&q=80&w=1200',
    coverPageImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
    lessons: [
      { title: 'Welcome to the Architecture Node', type: 'IMAGE', duration: 5, desc: 'Welcome to the course. Here is an overview of the curriculum and the objectives we will master.' },
      { title: 'The Skeleton of the Web: Advanced Semantics', type: 'VIDEO', duration: 25, desc: 'Understanding the document object model and semantic hierarchy.' },
      { title: 'Logic Gate: Structural Foundations', type: 'QUIZ', duration: 15, quizData: { title: 'Structural Logic Exam', questions: [{ text: 'Which tag is modernly preferred for the primary section of a page?', options: [{ text: '<main>', isCorrect: true }, { text: '<section>', isCorrect: false }] }] } },
      { title: 'CSS Layout Engine: Flexbox & Grid Mastery', type: 'VIDEO', duration: 45, desc: 'Mastering the two-dimensional layout systems of the modern web.' }
    ],
    finalQuiz: { title: 'Web Engineering Certification', questions: [{ text: 'What is the role of <article> in HTML5?', options: [{ text: 'To represent self-contained, reusable content', isCorrect: true }, { text: 'To link external scripts', isCorrect: false }] }] }
  },
  {
    title: 'JavaScript Evolution: High-Performance Logic',
    description: 'Learn the core internal mechanics of the V8 engine, asynchronous concurrency, and functional programming prototypes.',
    tags: ['JavaScript', 'System Architecture', 'JS'],
    price: 2999,
    coverImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=1200',
    coverPageImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
    lessons: [
      { title: 'Initialization Sequence: JS Core', type: 'IMAGE', duration: 5, desc: 'Start your journey into the internal world of JavaScript engine and logic.' },
      { title: 'Engine V8 & The Execution Pipeline', type: 'VIDEO', duration: 50, desc: 'How JavaScript code is compiled and executed in modern browsers.' },
      { title: 'Logic Check: Execution Context', type: 'QUIZ', duration: 10, quizData: { title: 'JS Engine Fundamentals', questions: [{ text: 'Is JavaScript an interpreted or compiled language in V8?', options: [{ text: 'Just-In-Time Compiled', isCorrect: true }, { text: 'Purely Interpreted', isCorrect: false }] }] } },
      { title: 'The Event Loop & Concurrency Model', type: 'VIDEO', duration: 60, desc: 'Master the non-blocking I/O model that powers high-performance applications.' }
    ],
    finalQuiz: { title: 'JS Systems Certification', questions: [{ text: 'What is a Closure?', options: [{ text: 'A function bundled with its lexical environment', isCorrect: true }, { text: 'A way to stop a script', isCorrect: false }] }] }
  }
];

async function seed() {
  console.log('🚀 Initializing Curriculum with Cover Pages and In-Content Logic...');

  try {
    const instructorEmail = 'urrana1512@gmail.com';
    const hashedPassword = await bcrypt.hash('udit@1234', 10);
    
    const instructor = await prisma.user.upsert({
      where: { email: instructorEmail },
      update: { role: 'INSTRUCTOR' },
      create: {
        email: instructorEmail,
        name: 'Udit Rana',
        password: hashedPassword,
        role: 'INSTRUCTOR',
        avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      }
    });

    for (const c of COURSES) {
      console.log(`⚡ Sythesizing: ${c.title}...`);
      
      const course = await prisma.course.create({
        data: {
          title: c.title,
          description: c.description,
          tags: c.tags,
          price: c.price,
          instructorId: instructor.id,
          visibility: 'EVERYONE',
          isPublished: true,
          coverImage: c.coverImage
        }
      });

      for (let i = 0; i < c.lessons.length; i++) {
        const l = c.lessons[i];
        
        let linkedQuizId = null;
        if (l.type === 'QUIZ' && l.quizData) {
          const quiz = await prisma.quiz.create({
            data: {
              title: l.quizData.title,
              courseId: course.id,
              isFinal: false,
              rewards: { create: { attempt1: 100, attempt2: 50, attempt3: 25, attempt4: 10 } }
            }
          });
          linkedQuizId = quiz.id;
          for (let j = 0; j < l.quizData.questions.length; j++) {
            const q = l.quizData.questions[j];
            await prisma.question.create({
              data: { quizId: quiz.id, text: q.text, order: j + 1, options: { create: q.options } }
            });
          }
        }

        await prisma.lesson.create({
          data: {
            courseId: course.id,
            title: l.title,
            type: l.type,
            duration: l.duration,
            order: i + 1,
            videoUrl: l.type === 'VIDEO' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : null,
            // If it is the first lesson (Cover Page), use the coverPageImage
            fileUrl: (i === 0 && l.type === 'IMAGE') ? c.coverPageImage : null,
            description: l.desc || 'Integration Module',
            quizId: linkedQuizId
          }
        });
      }

      if (c.finalQuiz) {
        const quiz = await prisma.quiz.create({
          data: {
            title: c.finalQuiz.title,
            courseId: course.id,
            isFinal: true,
            rewards: { create: { attempt1: 500, attempt2: 300, attempt3: 150, attempt4: 50 } }
          }
        });
        for (let j = 0; j < c.finalQuiz.questions.length; j++) {
          const q = c.finalQuiz.questions[j];
          await prisma.question.create({
            data: { quizId: quiz.id, text: q.text, order: j + 1, options: { create: q.options } }
          });
        }
      }
    }

    console.log('✨ Full-Fidelity Database Synthesis Complete!');
  } catch (error) {
    console.error('❌ SEED FAILURE:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
