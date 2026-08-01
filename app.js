const endpoint = 'https://vibe-proxy-gqv4.onrender.com/v1/chat/completions';
const headers = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer sk-vibe-summer-2026',
};

const form = document.getElementById('topic-form');
const topicInput = document.getElementById('topic');
const statusEl = document.getElementById('status');

const agent1Output = document.getElementById('agent-1-output');
const agent2Output = document.getElementById('agent-2-output');
const agent3Output = document.getElementById('agent-3-output');

const agent1Actions = document.getElementById('agent-1-actions');
const agent2Actions = document.getElementById('agent-2-actions');
const agent3Actions = document.getElementById('agent-3-actions');

let currentTopic = '';
let agent1Text = '';
let agent2Text = '';
let agent3Text = '';
let currentStep = 1;

function setStatus(message) {
  statusEl.textContent = message;
}

function renderActions(step) {
  const actionsContainer = step === 1 ? agent1Actions : step === 2 ? agent2Actions : agent3Actions;
  actionsContainer.innerHTML = '';

  if (step === 1) {
    actionsContainer.innerHTML = `
      <button type="button" class="secondary" id="review-agent-1">Approve & continue</button>
    `;
  } else if (step === 2) {
    actionsContainer.innerHTML = `
      <button type="button" class="secondary" id="review-agent-2">Approve & continue</button>
    `;
  } else {
    actionsContainer.innerHTML = `
      <button type="button" class="secondary" id="review-agent-3">Finish workflow</button>
    `;
  }

  const button = actionsContainer.querySelector('button');
  button?.addEventListener('click', () => {
    if (step === 1) {
      currentStep = 2;
      setStatus('Agent 1 approved. Agent 2 is now refining the response.');
      runAgent2();
    } else if (step === 2) {
      currentStep = 3;
      setStatus('Agent 2 approved. Agent 3 is preparing the final report.');
      runAgent3();
    } else {
      setStatus('Workflow complete.');
    }
  });
}

function setOutput(step, text) {
  if (step === 1) {
    agent1Output.textContent = text;
  } else if (step === 2) {
    agent2Output.textContent = text;
  } else {
    agent3Output.textContent = text;
  }
}

async function callAgent(prompt) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'class-chat-model',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || 'No response returned.';
}

async function runAgent1() {
  setStatus('Agent 1 is generating the first response...');
  const prompt = `You are Agent 1. Produce an initial explanation about the topic: ${currentTopic}. Keep it clear and concise.`;
  agent1Text = await callAgent(prompt);
  setOutput(1, agent1Text);
  renderActions(1);
  setStatus('Agent 1 has produced a first draft. Review and approve it to continue.');
}

async function runAgent2() {
  setStatus('Agent 2 is improving and organizing the response...');
  const prompt = `You are Agent 2. Improve and organize this response for clarity and structure. Topic: ${currentTopic}\n\nResponse:\n${agent1Text}`;
  agent2Text = await callAgent(prompt);
  setOutput(2, agent2Text);
  renderActions(2);
  setStatus('Agent 2 has created an improved version. Review and approve it to continue.');
}

async function runAgent3() {
  setStatus('Agent 3 is drafting the final report...');
  const prompt = `You are Agent 3. Create a final report based on the topic: ${currentTopic}. Use the previous agent output as context and make it easy for a grade 7 student to understand.\n\nAgent 2 output:\n${agent2Text}`;
  agent3Text = await callAgent(prompt);
  setOutput(3, agent3Text);
  renderActions(3);
  setStatus('Agent 3 has completed the final report.');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  currentTopic = topicInput.value.trim();

  if (!currentTopic) {
    setStatus('Please enter a topic before starting.');
    return;
  }

  agent1Output.textContent = 'Waiting for the first draft.';
  agent2Output.textContent = 'Waiting for the improved version.';
  agent3Output.textContent = 'Waiting for the final report.';
  agent1Actions.innerHTML = '';
  agent2Actions.innerHTML = '';
  agent3Actions.innerHTML = '';
  currentStep = 1;

  try {
    await runAgent1();
  } catch (error) {
    console.error(error);
    setStatus('The request could not be completed. Please try again.');
  }
});
