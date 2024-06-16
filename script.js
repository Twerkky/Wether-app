document.addEventListener('DOMContentLoaded', () => {
    let templateWeatherCard = document.querySelector('#weatherCard').innerHTML;
    let outputWeatherCard = document.querySelector('#weatherContainer');
    let templatMainWeatherCard = document.querySelector('#mainWeatherCard').innerHTML;
    let outputMainCard = document.querySelector('#mainCardContainer');

    const apiKey = '11caeb27e64f43aeaab4878827b4f950';
    let cityUrl = `http://api.openweathermap.org/geo/1.0/zip?zip=E14,GB&appid=${apiKey}`;

    class FetchService {
        constructor(apiUrl) {
            this.apiUrl = apiUrl;
        }

        async fetchData() {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
    }

    class WeatherCard {
        constructor(day, imgWeather, temperature, date, city) {
            this.day = day;
            this.date = date;
            this.city = city;
            this.temperature = temperature;
            this.imgWeather = imgWeather;
        }

        renderMain(element) {
            let html = Mustache.render(templatMainWeatherCard, this);
            element.insertAdjacentHTML("beforeend", html);
        }

        renderSide(element) {
            let html = Mustache.render(templateWeatherCard, this);
            element.insertAdjacentHTML("beforeend", html);
        }

        static getFormattedDate(date) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[date.getMonth()];
            const day = date.getDate();
            const year = date.getFullYear();
            return `${month} ${day} ${year}`;
        }

        static getDayName(date) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[date.getDay()];
        }

        static createMain(data, city) {
            const weatherData = data;
            if (weatherData) {
                let date = new Date();
                const dayName = WeatherCard.getDayName(date);
                const formattedDate = WeatherCard.getFormattedDate(date);
                const weatherCard = new WeatherCard(
                    dayName,
                    `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`,
                    weatherData.main.temp + '°',
                    formattedDate,
                    city
                );
                weatherCard.renderMain(outputMainCard);
                setBackgroundImage(weatherData.weather[0].main);
            }
        }

        static createSide(data, count, city) {
            const weatherData = data;
            if (weatherData) {
                let date = nextDay(count);
                const dayName = WeatherCard.getDayName(date);
                const formattedDate = WeatherCard.getFormattedDate(date);
                const weatherCard = new WeatherCard(
                    dayName,
                    `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`,
                    weatherData.main.temp + '°',
                    formattedDate,
                    city
                );
                weatherCard.renderSide(outputWeatherCard);
            }
        }
    }

    function nextDay(count) {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + count);
        return tomorrow;
    }

    function setBackgroundImage(weatherCondition) {
        let backgroundImage;
        switch (weatherCondition.toLowerCase()) {
            case 'clear':
                backgroundImage = 'url("background/day.jpg")';
                break;
            case 'clouds':
                backgroundImage = 'url("background/clouds.jpg")';
                break;
            case 'rain':
                backgroundImage = 'url("background/rain.jpg")';
                break;
            case 'snow':
                backgroundImage = 'url("background/snow.jpg")';
                break;
            case 'thunderstorm':
                backgroundImage = 'url("background/thunder.jpg")';
                break;
            case 'mist':
            case 'fog':
                backgroundImage = 'url("background/fog.jpg")';
                break;
            default:
                backgroundImage = 'url("background/default.jpg")';
                break;
        }
        document.body.style.backgroundImage = backgroundImage;
    }

    async function fetchCityData() {
        try {
            const fetchService = new FetchService(cityUrl);
            return await fetchService.fetchData();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async function fetchWeatherData(cityName) {
        try {
            const url = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${cityName}&appid=${apiKey}`;
            const fetchService = new FetchService(url);
            return await fetchService.fetchData();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async function fetchAndRenderWeather(cityName = null) {
        let weatherData;
        if (!cityName) {
            const cityData = await fetchCityData();
            if (cityData && cityData.name) {
                cityName = cityData.name;
            } else {
                alert('Please, enter your city in the search box');
                return;
            }
        }

        weatherData = await fetchWeatherData(cityName);

        if (weatherData) {
            WeatherCard.createMain(weatherData.list[0], cityName);
            for (let i = 1; i <= 7; i++) {
                WeatherCard.createSide(weatherData.list[i], i, cityName);
            }
        }
    }

    document.getElementById('fetchWeather').addEventListener('click', async function () {
        const cityName = document.getElementById('cityName').value;
        outputWeatherCard.innerHTML = '';
        outputMainCard.innerHTML = '';

        await fetchAndRenderWeather(cityName);
    });

    window.addEventListener("load", async function () {
        await fetchAndRenderWeather();
    });
});









