# Manual de usuario

## Secciones

#### Area de dibujo

En el centro de la ventana se encuentra el area de dibujo, en la cual se puede dibujar con los comandos.

#### Ingreso de comandos

En la parte inferior de la ventana se encuentra el ingreso de comandos, en el cual se puede ingresar comandos para que sean ejecutados, en esta sección se puede usar las flechas arriba y abajo para navegar entre los comandos ingresados anteriormente.

#### Area de información

A la izquierda del area de dibujo se encuentra el area de información, en la cual se muestran los comandos disponibles, los atajos de teclado y el estado del cursor.

#### Area de codigo

A la derecha del area de dibujo se encuentra el area de codigo, en la cual se encuentra el historial de comandos ejecutados, y los botones para cargar y guardar un archivo de comandos y exportar el codigo a codigo python.

## Comandos

### Comandos de movimiento

- `rotar(x)` - Rota el cursor x grados en sentido de las manecillas del reloj.
- `adelante(x)` - Avanza el cursor x pasos en la dirección en la que está apuntando.
- `atras(x)` - Retrocede el cursor x pasos en la dirección en la que está apuntando.
- `xy(x, y)` - Mueve el cursor a la posición (x, y).

### Comandos de las primitivas

- `linea(x, y)` - Dibuja una línea desde la posición actual del cursor hasta la posición (x, y).
- `circulo(x)` - Dibuja un círculo con centro en la posición actual del cursor y radio x.
- `cuadrado(x)` - Dibuja un cuadrado de lado x desde la posición actual del cursor.
- `poligono(x1, y1, x2, y2, ...)` - Dibuja un polígono con vértices en las especificadas por los pares (x, y).

### Comandos de utilidad

- `limpiar()` - Limpia la pantalla y mueve el cursor a la posición (0, 0).
- `rellenar()` - Rellena el area en la que se encuentra el cursor con el color actual
- `color(r, g, b)` - Cambia el color con el que se dibuja, especificado por los valores de rojo, verde y azul en el rango de 0 a 255.

### Comandos de control

- `para(inicio; fin; pasos)` - Dibuja puntos desde inicio hasta fin con pasos de diferencia.

## Atajos

- `Ctrl + z` - Deshace el último comando.
- `Ctrl + y` - Rehace el último comando deshecho.
- `Ctrl + g` - Muestra u oculta la cuadrícula.
