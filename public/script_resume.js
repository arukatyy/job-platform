document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resumeForm');
    const message = document.getElementById('message');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const getVal = id => document.getElementById(id)?.value?.trim() || '';

        const data = {
            username: getVal('username'),
            fullName: getVal('fullName'),
            position: getVal('position'),
            experience: getVal('experience'),
            city: getVal('city'),
            phone: getVal('phone'),
            email: getVal('email')
        };

        try {
            const res = await fetch('/api/resumes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const text = await res.text().catch(() => '<no body>');
                throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
            }

            let result;
            try {
                result = await res.json();
            } catch (parseErr) {
                const txt = await res.text().catch(() => '<no body>');
                throw new Error(`Invalid JSON response: ${parseErr.message}; body: ${txt}`);
            }

            if (result.success) {
                message.style.color = 'green';
                message.textContent = 'Резюме сәтті қосылды!';
                form.reset();
            } else {
                message.style.color = 'red';
                message.textContent = result.message || 'Қате! Резюме қосылмады';
            }

        } catch (err) {
            message.style.color = 'red';
            message.textContent = 'Сервермен байланыс қате: ' + (err.message || 'Unknown error');
            console.error('Add resume error:', err);
        }
    });
});