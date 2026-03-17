const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

myEmitter.on('userCreated', (user) => {
    console.log(`Жаңа қолданушы тіркелді: ${user.username} (${user.role})`);
});

myEmitter.on('loginAttempt', (data) => {
    console.log(`Кіру әрекеті: ${data.username}, Сәттілік: ${data.success}`);
});

myEmitter.on('jobCreated', (data) => {
    console.log(`Admin ${data.admin} жаңа жұмыс қосты: ${data.job.title} (${data.job.city})`);
});

myEmitter.on('resumeAdded', ({ username, resume }) => {
    console.log(`Қолданушы ${username} жаңа резюме қосты: ${resume.fullName}`);
});

module.exports = myEmitter;