#include <iostream>
#include <cstdlib>
#include <ctime>

using namespace std;

int main() {
    srand(time(NULL));

    /*
    1. Herramientas computacionales :

    - Variables
    - Arreglos
    - Estructuras repetitivas
    - Estructuras condicionales
    - Numeros aleatorios
    - Contadores

    La herramienta que mas aporta a la optimizacion del codigo es el uso de arreglos,
    porque permite manejar los 10 estantes usando una sola estructura, en lugar de crear
    muchas variables separadas para cada estante(como estante1,estante2,etc.).

    2. Optimizacion adicional propuesta:

    Una forma de mejorar el codigo seria no guardar el peso de cada rollo uno por uno,
    sino solo ir contando cuantos rollos caen en cada rango de peso. Asi el programa
    usa menos memoria, porque ya no tendria que guardar los 700 pesos.

    Pero en este codigo si se guardan los pesos en arreglos, porque asi se entiende mejor
    como se van moviendo los rollos de un estante a otro como dice el problema..
    */

    // ENTRADA
    int X = 10;
    int Z = 30;
    int W = 60;
    int V = 80;
    int Y = 100;

    int estantes[10][700];
    int cantidad[10];

    int peso;
    int usados = 0;
    int devueltos = 0;

    for (int i = 0; i < 10; i++) {
        cantidad[i] = 0;
    }

    cout << "ALMACEN TEXTIL" << endl;
    cout << "Valores escogidos:" << endl;
    cout << "X = " << X << endl;
    cout << "Z = " << Z << endl;
    cout << "W = " << W << endl;
    cout << "V = " << V << endl;
    cout << "Y = " << Y << endl;

    // PROCESO

    // Paso 1:
    // Inicialmente los 500 rollos estan desordenados en un solo estante.
    for (int i = 0; i < 500; i++) {
        peso = X + rand() % (Y - X + 1);
        estantes[0][cantidad[0]] = peso;
        cantidad[0]++;
    }

    cout << "\nPaso 1: Se generaron 500 rollos en el estante 1." << endl;

    // Paso 2:
    // Separar rollos entre X y Z en un estante,
    // y el resto entre Z y Y en otro estante.
    for (int i = 0; i < cantidad[0]; i++) {
        peso = estantes[0][i];

        if (peso >= X && peso < Z) {
            estantes[1][cantidad[1]] = peso;
            cantidad[1]++;
        } else {
            estantes[2][cantidad[2]] = peso;
            cantidad[2]++;
        }
    }

    cantidad[0] = 0;

    cout << "Paso 2: Se separaron los rollos entre X-Z y Z-Y." << endl;

    // Paso 3:
    // Del estante que tiene rollos entre Z y Y,
    // separar los rollos entre Z y W.
    for (int i = 0; i < cantidad[2]; i++) {
        peso = estantes[2][i];

        if (peso >= Z && peso < W) {
            estantes[3][cantidad[3]] = peso;
            cantidad[3]++;
        } else {
            estantes[4][cantidad[4]] = peso;
            cantidad[4]++;
        }
    }

    cantidad[2] = 0;

    cout << "Paso 3: Se separaron los rollos entre Z-W y W-Y." << endl;

    // Paso 4:
    // Nuevo lote de produccion de 200 rollos entre X y Y.
    // Primero se colocan en un estante adicional.
    for (int i = 0; i < 200; i++) {
        peso = X + rand() % (Y - X + 1);
        estantes[5][cantidad[5]] = peso;
        cantidad[5]++;
    }

    cout << "Paso 4: Se recibio un nuevo lote de 200 rollos en un estante adicional." << endl;

    // Paso 5:
    // Reubicar los 200 rollos nuevos en los estantes ya existentes,
    // segun su rango de peso.
    for (int i = 0; i < cantidad[5]; i++) {
        peso = estantes[5][i];

        if (peso >= X && peso < Z) {
            estantes[1][cantidad[1]] = peso;
            cantidad[1]++;
        } else if (peso >= Z && peso < W) {
            estantes[3][cantidad[3]] = peso;
            cantidad[3]++;
        } else {
            estantes[4][cantidad[4]] = peso;
            cantidad[4]++;
        }
    }

    cantidad[5] = 0;

    cout << "Paso 5: Los 200 rollos nuevos fueron reubicados en los otros estantes." << endl;

    // Paso 6:
    // Finalmente, separar en un nuevo estante los rollos entre W y V.
    // Estos rollos salen del estante que tenia rollos entre W y Y.
    int nuevaCantidadEstante4 = 0;

    for (int i = 0; i < cantidad[4]; i++) {
        peso = estantes[4][i];

        if (peso >= W && peso < V) {
            estantes[6][cantidad[6]] = peso;
            cantidad[6]++;
        } else {
            estantes[4][nuevaCantidadEstante4] = peso;
            nuevaCantidadEstante4++;
        }
    }

    cantidad[4] = nuevaCantidadEstante4;

    cout << "Paso 6: Se separaron los rollos entre W-V en un nuevo estante." << endl;

    // SALIDA
    cout << "\nDISTRIBUCION FINAL" << endl;
    cout << "Estante 1: " << cantidad[0] << " rollos" << endl;
    cout << "Estante 2: " << cantidad[1] << " rollos entre X y Z" << endl;
    cout << "Estante 3: " << cantidad[2] << " rollos" << endl;
    cout << "Estante 4: " << cantidad[3] << " rollos entre Z y W" << endl;
    cout << "Estante 5: " << cantidad[4] << " rollos entre V y Y" << endl;
    cout << "Estante 6: " << cantidad[5] << " rollos" << endl;
    cout << "Estante 7: " << cantidad[6] << " rollos entre W y V" << endl;
    cout << "Estante 8: " << cantidad[7] << " rollos" << endl;
    cout << "Estante 9: " << cantidad[8] << " rollos" << endl;
    cout << "Estante 10: " << cantidad[9] << " rollos" << endl;

    for (int i = 0; i < 10; i++) {
        if (cantidad[i] > 0) {
            usados++;
        } else {
            devueltos++;
        }
    }

    cout << "\nRESUMEN FINAL" << endl;
    cout << "Total de rollos finales: ";
    cout << cantidad[1] + cantidad[3] + cantidad[4] + cantidad[6] << endl;

    cout << "Estantes usados: " << usados << endl;
    cout << "Estantes que pueden ser devueltos: " << devueltos << endl;

    return 0;
}