const fs = require('fs');

const axios = require('axios').default;

class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        this.cargarDB();
    }

    get historialCapitalizado(){
        return this.historial.map( (lugar = '') => {
            
            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );
            return palabras.join(' ');
        });
    }

    get paramsMapbox(){
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsWather(){
        return{
            'appid': '1caa35d91301bf56a2a3acfd3d4ebef4',
            'units': 'metric',
            'lang': 'es'
        }
    }

    async buscarCiudad( lugar = '' ){

        // peticion http
        try{

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar.trim() }.json`,
                params: this.paramsMapbox
            });

            // Hacer la petición http
            const resp = await instance.get();

            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));

        } catch (err) {
            return [];
        }

    }

    async climaLugar( lat, lon ){

        try{

            // intance axios.create()
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?`,
                params: { ...this.paramsWather, lat, lon }
            })

            // Realizar la petición http
            const resp = await instance.get();

            // resp.data
            const { main: { temp, temp_min, temp_max }, weather:[ { description } ] } = resp.data;
            
            return({
                desc: description,
                min: temp_min,
                max: temp_max,
                temp: temp
            })

        } catch( err ){
            throw err;
        }
    }
    
    agregarHistorial( lugar = '' ){

        if( this.historial.includes( lugar.toLocaleLowerCase() ) ){
            return;
        }

        this.historial.unshift( lugar.toLocaleLowerCase() );

        // Grabar en db
        this.guardarDB();
    }

    guardarDB(){

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload) );
    }

    cargarDB(){
        
        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } );

        if( info ){

            const data = JSON.parse(info);
            
            return this.historial = [...data.historial];
        }

        return [];
    }
}

module.exports = Busquedas;