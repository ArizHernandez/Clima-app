require('dotenv').config()
const colors = require('colors');

const { 
    leerInput,
    inquirerMenu,
    pausa,
    listarLugares
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

// console.log(process.env)

const main = async () => {

    const busquedas = new Busquedas();
    let opt;
    
    do{ 
        opt = await inquirerMenu();

        switch( opt ){

            case 1:

                // Mostrar Mensaje
                const termino = await leerInput('Ingrese la ciudad que busca: ');
                
                // Buscar los lugares
                const lugares = await busquedas.buscarCiudad(termino);
                
                // Seleccionar el lugar
                const id = await listarLugares( lugares );
                if(id === '0') continue;
                
                const lugarSel = lugares.find( lugar => lugar.id === id );

                // guardar lugar al historial
                busquedas.agregarHistorial(lugarSel.nombre);

                // Clima
                console.log('Cargando...')
                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);

                // mostrar Resultados
                console.clear();
                console.log('\nInformación del la ciudad\n'.green);
                console.log('Ciudad:', lugarSel.nombre);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log('Temperatura:', clima.temp);
                console.log('Mínima:', clima.min);
                console.log('Máxima:', clima.max);
                console.log('Como está el clima:', colors.cyan( clima.desc) );

            break;

            case 2:


                busquedas.historialCapitalizado.forEach( (lugar, index) => {
                    const idx = `${ index + 1 }.`.green;
                    console.log(`${ idx } ${lugar}`)
                })

            break;

        }

        if( opt !== 0) await pausa();

    } while( opt !== 0 );
}

main();