document.addEventListener('DOMContentLoaded', () => {
    const jobsContainer = document.getElementById('jobs');
    const searchBtn = document.getElementById('search');
    const citySelect = document.getElementById('city');

    function displayJobs(jobs) {
        jobsContainer.innerHTML = '';
        if (jobs.length === 0) {
            jobsContainer.innerHTML = '<li>Жұмыс табылмады</li>';
            return;
        }

        jobs.forEach(job => {
            const li = document.createElement('li');
            li.innerHTML = `
                <h3>${job.title}</h3>
                <p><strong>Компания:</strong> ${job.company || '-'}</p>
                <p><strong>Қала:</strong> ${job.city}</p>
                <p><strong>Жалақы:</strong> ${job.salary || '-'}</p>
                <p><strong>Тәжірибе:</strong> ${job.experience || '-'}</p>
                <p><strong>Жұмыс түрі:</strong> ${job.employment || '-'}</p>
                <p><strong>Кесте:</strong> ${job.schedule || '-'}</p>
                <p><strong>Міндеттері:</strong> ${job.responsibilities || '-'}</p>
                <p><strong>Талаптары:</strong> ${job.requirements || '-'}</p>
                <p><strong>Байланыс:</strong> ${job.contactphone || '-'}, ${job.contactemail || '-'}</p>
            `;
            jobsContainer.appendChild(li);
        });
    }

    function loadJobs(city = '') {
        let url = '/api/jobs';
        if (city) url += `?city=${encodeURIComponent(city)}`;

        fetch(url)
            .then(res => res.json())
            .then(jobs => displayJobs(jobs))
            .catch(err => {
                console.error('Қате:', err);
                jobsContainer.innerHTML = '<li>Серверге қосыла алмай отырмыз</li>';
            });
    }

    loadJobs();

    searchBtn.addEventListener('click', () => {
        const city = citySelect.value;
        loadJobs(city);
    });
});