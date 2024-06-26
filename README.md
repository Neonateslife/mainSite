# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


```js
function getAvailableDays(selectedDay) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date();
    const selectedDayIndex = daysOfWeek.indexOf(selectedDay);
    const selectedDate = new Date();
    selectedDate.setDate(currentDate.getDate() + (selectedDayIndex - currentDate.getDay() + 7) % 7);
    
    const availableDays = [];
    for (let i = 0; i < 30; i++) {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + i * 7);
        const difference = nextDay - currentDate;
        if (difference >= 0 && difference <= 30 * 24 * 60 * 60 * 1000) {
            availableDays.push(nextDay.toDateString());
        }
    }
    return availableDays;
}

const selectedDay = 'Tuesday'; // Change this to the day selected by the user
const availableDays = getAvailableDays(selectedDay);
console.log(`Available ${selectedDay}s in the next 30 days:`);
availableDays.forEach(day => console.log(day));
```