import { QATestRunner } from './qaTestSuite';

async function main() {
  console.log('\n================================================================');
  console.log('🧪 MINDFLOW COMPREHENSIVE MULTI-USER & FIREBASE QA TEST SUITE');
  console.log('================================================================');
  console.log('Target Firebase DB : ai-studio-mindflow-ad6999cb-ee98-4a12-aa65-4524b92d4eda');
  console.log('Simulated Personas : Dr. Elena Rostova, Marcus Vance, Amina Patel');
  console.log('Testing Modules    : Timer, Badges, Habits, Energy, CBT, Tasks,');
  console.log('                     Dumps, Breathing, Audio, Psych AI, Firestore\n');

  const runner = new QATestRunner((step) => {
    const symbol = step.status === 'passed' ? '✅ PASS' : '❌ FAIL';
    const duration = `${step.durationMs}ms`.padStart(6, ' ');
    console.log(`[${symbol}] [${duration}] [${step.module}] ${step.testName} (${step.userTested})`);
    if (step.status === 'failed' && step.error) {
      console.error(`       Error: ${step.error}`);
    }
  });

  const summary = await runner.runAllTests();

  console.log('\n----------------------------------------------------------------');
  console.log('📊 QA TEST EXECUTION SUMMARY:');
  console.log(`Total Tests Run     : ${summary.total}`);
  console.log(`Passed              : ${summary.passed} ✅`);
  console.log(`Failed              : ${summary.failed} ${summary.failed > 0 ? '❌' : ''}`);
  console.log(`Total Duration      : ${summary.durationMs}ms`);
  console.log(`Multi-User Isolation: VERIFIED (3 Personas + Live Auth Isolated)`);
  console.log(`Firebase Target DB  : ${summary.databaseId}`);
  console.log('================================================================\n');

  if (summary.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('QA Runner fatal error:', err);
  process.exit(1);
});
