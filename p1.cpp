#include <iostream>
#include <cstdlib>
#include <ctime>

using namespace std;

int main() {
    /*numero aleatorio*/
    srand(time(NULL));
/*aqui se usan variables*/
    int fichas1 = 30;
    int fichas2 = 30;
    int intentos = 5;

    int numeroSecreto;
    int numeroJugador;
    int apuesta;

    cout << "JUEGO DE APUESTAS" << endl;
    cout << "elija el nuero de intentos: ";
    cin >> intentos;
    cout << "Cada jugador empieza con 30 fichas." << endl;
    cout << "Se jugaran " << intentos << " intentos." << endl;

/*estructuras de bucles for*/
    for (int i = 1; i <= intentos; i++) {
        cout << "\nIntento " << i << endl;

        numeroSecreto = 10 + rand() % 90;
        /*salida de datos*/
        cout << "\nTurno del Jugador 1" << endl;
        cout << "Fichas actuales: " << fichas1 << endl;

        cout << "Ingrese apuesta: ";
        /*entrada de datos*/
        cin >> apuesta;
        /*estructura de condicional if*/
        if (apuesta > fichas1) {
            cout << "No puede apostar mas fichas de las que tiene." << endl;
            apuesta = fichas1;
        }

        cout << "Adivine el numero de dos digitos: ";
        cin >> numeroJugador;

        if (numeroJugador == numeroSecreto) {
            fichas1 = fichas1 + apuesta * 10;
            cout << "Acerto. Gano " << apuesta * 10 << " fichas." << endl;
        } else {
            fichas1 = fichas1 - apuesta;
            cout << "Fallo. Perdio " << apuesta << " fichas." << endl;
        }

        if (fichas1 <= 0) {
            cout << "Jugador 1 se quedo sin fichas. Pierde." << endl;
            break;
        }

        cout << "\nTurno del Jugador 2" << endl;
        cout << "Fichas actuales: " << fichas2 << endl;

        cout << "Ingrese apuesta: ";
        cin >> apuesta;

        if (apuesta > fichas2) {
            cout << "No puede apostar mas fichas de las que tiene." << endl;
            apuesta = fichas2;
        }

        cout << "Adivine el numero de dos digitos: ";
        cin >> numeroJugador;

        if (numeroJugador == numeroSecreto) {
            fichas2 = fichas2 + apuesta * 10;
            cout << "Acerto. Gano " << apuesta * 10 << " fichas." << endl;
        } else {
            fichas2 = fichas2 - apuesta;
            cout << "Fallo. Perdio " << apuesta << " fichas." << endl;
        }

        if (fichas2 <= 0) {
            cout << "Jugador 2 se quedo sin fichas. Pierde." << endl;
            break;
        }

        cout << "El numero secreto era: " << numeroSecreto << endl;
    }

    cout << "\nRESULTADO FINAL" << endl;
    cout << "Jugador 1: " << fichas1 << " fichas" << endl;
    cout << "Jugador 2: " << fichas2 << " fichas" << endl;

    if (fichas1 > fichas2) {
        cout << "Gana el Jugador 1" << endl;
    } else if (fichas2 > fichas1) {
        cout << "Gana el Jugador 2" << endl;
    } else {
        cout << "Empate" << endl;
    }

    return 0;
}

/*La herramienta que mas aporta a la optimizacion del codigo es la estructura repetitiva for,
porque evita repetir*/

/*Una optimizacion adicional seria usar un arreglo para guardar los numeros secretos
que ya salieron, y asi evitar que se repitan en otros intentos.

Esta optimizacion ayuda a cumplir mejor la condicion del ejercicio que dice que
en cada intento se debe adivinar un numero distinto.*/