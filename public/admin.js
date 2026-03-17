document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('jobForm');
    const message = document.getElementById('message');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            username: document.getElementById('username').value,
            title: document.getElementById('title').value,
            company: document.getElementById('company').value,
            city: document.getElementById('city').value,
            salary: document.getElementById('salary').value,
            experience: document.getElementById('experience').value,
            employment: document.getElementById('employment').value,
            schedule: document.getElementById('schedule').value,
            responsibilities: document.getElementById('responsibilities').value,
            requirements: document.getElementById('requirements').value,
            contactphone: document.getElementById('contactphone').value,
            contactemail: document.getElementById('contactemail').value
        };

        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });              

            const result = await res.json();

            if (result.success) {
                message.style.color = 'green';
                message.textContent = 'Жұмыс сәтті қосылды!';
                form.reset();
            } else {
                message.style.color = 'red';
                message.textContent = result.message || 'Қате! Жұмыс қосылмады';
            }

        } catch (err) {
            message.style.color = 'red';
            message.textContent = 'Сервермен байланыс қате';
            console.error('Add job error:', err);
        }
    });
});