import { BriefingEngine } from './brain';
import { Classroom, Teacher } from './domain';

async function main() {
  console.log('🚀 Memulai BULAENG Classroom OS...\n');

  // 1. Inisialisasi data domain
  const dummyTeacher: Teacher = {
    id: 'tch-001',
    name: 'Ibu Rosiana',
    role: 'TEACHER',
    email: 'rosiana@bulaeng.id',
    assignedClassroomIds: ['cls-paud-a'],
    createdAt: new Date(),
  };

  const dummyClassroom: Classroom = {
    id: 'cls-paud-a',
    name: 'PAUD Bintang Kecil (Kelas A)',
    academicYear: '2026/2027',
    leadTeacherId: 'tch-001',
    studentIds: ['std-001', 'std-002'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 2. Jalankan AI Engine (Brain)
  const engine = new BriefingEngine();
  const result = await engine.generateDailyBriefing({
    teacher: dummyTeacher,
    classroom: dummyClassroom,
    date: new Date().toISOString(),
  });

  // 3. Tampilkan hasil
  console.log('--- Daily Briefing Result ---');
  console.log(`Ringkasan   : ${result.summary}`);
  console.log(`Fokus CP    : ${result.focusElements.join(', ')}`);
  console.log('Rekomendasi Aktivitas:');
  result.recommendedActivities.forEach((act, idx) => {
    console.log(`  ${idx + 1}. ${act}`);
  });
}

main().catch(console.error);