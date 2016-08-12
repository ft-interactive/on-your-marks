export default function send({swim, cycle, sprint}) {
  const fd = new FormData(form)
  // cycle
  fd.append('entry.805886038', cycle)
  // swim
  fd.append('entry.2001588877', swim)
  // sprint
  fd.append('entry.1659522549', sprint)

  return fetch('//docs.google.com/a/ft.com/forms/d/e/1FAIpQLSebtaiCXv5HHtH6hozdZ7jLhT99fZyd2fmhJxz4E1m-YJbjEQ/formResponse', {
    method: 'POST',
    body: fd
  });
}

// window.onblur = (event) => {
// console.log('heello');
// };
