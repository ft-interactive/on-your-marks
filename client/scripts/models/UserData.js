const formId = '1FAIpQLSebtaiCXv5HHtH6hozdZ7jLhT99fZyd2fmhJxz4E1m-YJbjEQ';
const formAction = `https://docs.google.com/a/ft.com/forms/d/e/${formId}/formResponse`;
const fields = {
  cycle: 'entry.805886038',
  swim: 'entry.2001588877',
  sprint: 'entry.1659522549',
};

export default function send({ swim, cycle, sprint }) {
  const fd = new FormData();
  fd.append(fields.cycle, cycle);
  fd.append(fields.swim, swim);
  fd.append(fields.spring, sprint);

  return fetch(formAction, {
    method: 'POST',
    body: fd,
  });
}

// window.onblur = (event) => {
// console.log('heello');
// };
