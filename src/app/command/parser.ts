import type { ParsedCommand } from "..";

export default function detectFunctionCall(
  str: string,
  paramsSeparator = ","
): ParsedCommand | null {
  // La expresión regular para detectar una llamada a función válida con números decimales positivos o negativos es:
  // (nombre_de_función)\s*\(\s*([-+]?\d+(\.\d+)?(\s*,\s*[-+]?\d+(\.\d+)?)*)?\s*\)
  // const pattern =
  //   /^\s*(\w+)\s*\(\s*([-+]?\d+(\.\d+)?(\s*,\s*[-+]?\d+(\.\d+)?)*)?\s*\)\s*;?$/;
  const pattern = new RegExp(
    `^\\s*(\\w+)\\s*\\(\\s*([-+]?\\d+(\\.\\d+)?(\\s*${paramsSeparator}\\s*[-+]?\\d+(\\.\\d+)?)*)?\\s*\\)\\s*;?$`
  );

  // Usamos el método match de la expresión regular para obtener los grupos de captura
  const match = str.match(pattern);

  // Si el string no cumple con el patrón, devolvemos null
  if (!match) {
    return null;
  }

  // De lo contrario, obtenemos los parámetros enviados a la función
  const name = match[1];
  const args = match[2]
    ? match[2].split(paramsSeparator).map((arg) => parseFloat(arg.trim()))
    : [];

  return { name, args };
}
