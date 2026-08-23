here// ASI - FINAL WORKING STUDENT JS - Custom Test Show

function loadAllTests(){
  const testListDiv = document.getElementById('testList');
  const testsCount = document.getElementById('tests');
  if(!testListDiv) return;

  let published = JSON.parse(localStorage.getItem('asi_published_tests') || '[]');
  let oldCustom = JSON.parse(localStorage.getItem('asi_custom_tests') || '[]');
  
  // Duplicate hatao
  let allTests = [...published];
  oldCustom.forEach(t=>{
    if(!allTests.find(x=>x.id===t.id)) allTests.push(t);
  });

  if(testsCount) testsCount.innerText = allTests.length;

  if(allTests.length === 0){
    testListDiv.innerHTML = `<p class="muted">No tests published yet. Teacher can publish a test from the Teacher Dashboard.</p>`;
    return;
  }

  testListDiv.innerHTML = "";
  allTests.slice().reverse().forEach(t=>{
    let title = t.title || t.name || "Custom Test";
    let exam = t.exam || "SSC";
    let subject = t.subject || "General";
    let qCount = t.questions ? t.questions.length : 5;
    let duration = t.duration || 60;

    testListDiv.innerHTML += `
      <div class="test-card" style="border:2px solid #111; border-radius:12px; padding:16px; margin:12px 0; background: ${t.isCustom!==false ? '#ffffcc' : 'white'};">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="background:#111; color:white; padding:4px 10px; border-radius:20px; font-size:11px;">🔥 CUSTOM LIVE</span>
          <small>${exam} | ${subject}</small>
        </div>
        <h3 style="margin:10px 0;">${title}</h3>
        <p style="margin:0; color:#555; font-size:13px;">${qCount} Questions • ${duration} Minutes • Full Syllabus</p>
        <a href="test.html?id=${t.id}" style="display:block; text-align:center; background:#111; color:white; padding:12px; border-radius:8px; margin-top:12px; text-decoration:none; font-weight:bold;">Custom Test Do → Start Now</a>
      </div>
    `;
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  loadAllTests();
  setTimeout(loadAllTests, 800);
});
