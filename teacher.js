her// ASI INSTITUTE - Teacher Dashboard Final JS
const BOT_TOKEN = "8946531889:AAEEd9eNB28gyHx5OusQ2g2f6oHzM78Bms";
const CHAT_ID = "8993427718";
const TEACHER_PASS = "SHah@#56";

let extractedQuestions = [];

// Teacher Login Check
(function checkLogin(){
  let pass = localStorage.getItem('teacher_login');
  if(pass!== TEACHER_PASS){
    let p = prompt("Teacher Password Daalo:");
    if(p === TEACHER_PASS){
      localStorage.setItem('teacher_login', p);
    } else {
      alert("Wrong Password!");
      window.location.href = "index.html";
    }
  }
})();

function previewPDF(){
  const fileInput = document.getElementById('pdf');
  const title = document.getElementById('title')?.value || "Custom Test";
  const exam = document.getElementById('exam')?.value || "SSC";
  const subject = document.getElementById('subject')?.value || "General";
  const duration = document.getElementById('duration')?.value || 60;

  if(!fileInput.files[0]){
    alert("Pehle PDF select karo!");
    return;
  }

  // Demo Questions - quiz_generator.py se real parse hoga
  extractedQuestions = [
    {q: "What is the capital of India?", options: ["Mumbai", "Delhi", "Kolkata", "Chennai"], ans: 1},
    {q: "Taj Mahal kahan hai?", options: ["Delhi", "Agra", "Jaipur", "Lucknow"], ans: 1},
    {q: "Photosynthesis me kya banta hai?", options: ["O2", "CO2", "N2", "H2"], ans: 0},
    {q: "2+2 =?", options: ["3", "4", "5", "6"], ans: 1},
    {q: "NEET ka full form?", options: ["National Eligibility cum Entrance Test", "National Exam", "Medical Test", "None"], ans: 0}
  ];

  let preview = document.getElementById('preview');
  preview.innerHTML = `<h3>Preview: ${title} [${exam} - ${subject}] - ${duration} min</h3>`;
  extractedQuestions.forEach((item, i)=>{
    preview.innerHTML += `<div style='border:1px solid #ddd; padding:10px; margin:8px 0; border-radius:8px;'><b>Q${i+1}. ${item.q}</b><br>${item.options.map((o,j)=> `${j==item.ans? '✅' : '○'} ${o}`).join('<br>')}</div>`;
  });

  localStorage.setItem('temp_questions', JSON.stringify(extractedQuestions));
  alert("PDF Preview Ready! Ab Publish LIVE dabao");
}

async function publishTest(){
  const title = document.getElementById('title').value;
  const exam = document.getElementById('exam').value;
  const subject = document.getElementById('subject').value;
  const duration = document.getElementById('duration').value;

  if(!title){ alert("Test Title Daalo!"); return; }
  if(extractedQuestions.length==0){
    let temp = localStorage.getItem('temp_questions');
    if(temp) extractedQuestions = JSON.parse(temp);
    else { alert("Pehle Preview karo!"); return; }
  }

  const newTest = {
    id: "TEST_" + Date.now(),
    title: title,
    exam: exam,
    subject: subject,
    duration: duration,
    questions: extractedQuestions,
    createdAt: new Date().toLocaleString(),
    isCustom: true
  };

  let published = JSON.parse(localStorage.getItem('asi_published_tests') || '[]');
  published.push(newTest);
  localStorage.setItem('asi_published_tests', JSON.stringify(published));

  let allTests = JSON.parse(localStorage.getItem('asi_custom_tests') || '[]');
  allTests.push(newTest);
  localStorage.setItem('asi_custom_tests', JSON.stringify(allTests));

  renderPublished();

  // Telegram
  try{
    let msg = `🚀 ASI SULTANPUR - Naya Test!%0AName: ${title}%0ATest: ${exam} - ${subject}%0AMarks: ${extractedQuestions.length}%0ATime: ${duration} min%0ALink: https://shahrukhkassar.github.io/ASI-INSTITUTE/test.html?id=${newTest.id}`;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${msg}`);
  }catch(e){}

  alert("✅ Custom Test Published! - " + title);
}

function renderPublished(){
  let div = document.getElementById('published');
  if(!div) return;
  let published = JSON.parse(localStorage.getItem('asi_published_tests') || '[]');
  if(published.length==0){ div.innerHTML = "<p class='muted'>Koi test publish nahi hua abhi.</p>"; return; }
  div.innerHTML = "";
  published.reverse().forEach(t=>{
    div.innerHTML += `<div style='border:1px solid #eee; padding:10px; margin:6px 0; border-radius:8px;'><b>${t.title}</b> - ${t.exam} | ${t.subject} | ${t.questions.length} Qs | ${t.createdAt} <br><a href='test.html?id=${t.id}' target='_blank'>View Link</a> | <button onclick="deleteTest('${t.id}')">Delete</button></div>`;
  });
}

function deleteTest(id){
  let published = JSON.parse(localStorage.getItem('asi_published_tests') || '[]');
  published = published.filter(t=>t.id!==id);
  localStorage.setItem('asi_published_tests', JSON.stringify(published));
  renderPublished();
}

document.addEventListener('DOMContentLoaded', renderPublished);
