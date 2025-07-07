class WeatherPlugin {
    constructor(locations) {
        this.apiKey = '0bd483ef3c7bff2f1ab67288d35d6539';
        this.locations = locations;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
        this.init();
    }

    init() {
        console.log('Inicializando WeatherPlugin con ubicaciones:', this.locations);
        this.loadWeatherData();
        setInterval(() => this.loadWeatherData(), 600000);
    }

    async loadWeatherData() {
        console.log('Cargando datos meteorológicos para las ubicaciones:', this.locations);
        for (const location of this.locations) {
            try {
                console.log(`Obteniendo datos para ${location.name} (lat: ${location.lat}, lon: ${location.lon})`);
                await this.fetchWeatherData(location);
            } catch (error) {
                console.error(`Error loading weather for ${location.name}:`, error);
                this.displayError(location.id, `Error al cargar datos de ${location.name}`);
            }
        }
    }

    async fetchWeatherData(location) {
        const response = await fetch(`${this.baseUrl}?lat=${location.lat}&lon=${location.lon}&appid=${this.apiKey}&units=metric&lang=es`);
        if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status}`);
        }
        const data = await response.json();
        this.displayWeatherForecast(location.id, data);
    }

    displayWeatherForecast(elementId, data) {
        console.log('Mostrando previsión meteorológica para:', data.city.name);
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Elemento con ID ${elementId} no encontrado en el DOM.`);
            return;
        }

        const forecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
        const forecastHtml = forecasts.map(forecast => {
            const date = new Date(forecast.dt * 1000);
            const temp = Math.round(forecast.main.temp);
            const description = forecast.weather[0].description;
            return `
                <div class="forecast-item">
                    <span class="forecast-date">${date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    <span class="forecast-temp">${temp}°C</span>
                    <span class="forecast-desc">${description}</span>
                </div>
            `;
        }).join('');

        element.innerHTML = `
            <h4><i class="fas fa-map-marker-alt"></i> ${data.city.name}</h4>
            <div class="forecast-container">
                ${forecastHtml}
            </div>
        `;
    }

    displayError(elementId, message) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

function initializeWeatherWidget(locations) {
    console.log('Inicializando el widget meteorológico con las siguientes ubicaciones:', locations);

    if (!locations || !Array.isArray(locations)) {
        console.error('La lista de ubicaciones no es válida o está vacía.');
        return;
    }

    locations.forEach(location => {
        const container = document.getElementById(location.id);
        if (!container) {
            console.error(`Contenedor con id ${location.id} no encontrado en el DOM.`);
            return;
        }

        container.innerHTML = `
            <h4><i class="fas fa-map-marker-alt"></i> ${location.name}</h4>
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> Cargando datos del tiempo...
            </div>
        `;
    });

    new WeatherPlugin(locations);
}
