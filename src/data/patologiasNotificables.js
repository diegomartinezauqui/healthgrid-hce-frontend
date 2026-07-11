export const PATOLOGIAS_NOTIFICABLES = [
  { codigo: 'DEN',  nombre: 'Dengue',                          modalidad: 'inmediata', grupo: 'Vectoriales',           claves: ['dengue'] },
  { codigo: 'ZIK',  nombre: 'Zika',                            modalidad: 'inmediata', grupo: 'Vectoriales',           claves: ['zika'] },
  { codigo: 'CHIK', nombre: 'Chikungunya',                     modalidad: 'inmediata', grupo: 'Vectoriales',           claves: ['chikungunya', 'chikunguna'] },
  { codigo: 'FA',   nombre: 'Fiebre amarilla',                 modalidad: 'inmediata', grupo: 'Vectoriales',           claves: ['fiebre amarilla'] },
  { codigo: 'PAL',  nombre: 'Paludismo (Malaria)',             modalidad: 'inmediata', grupo: 'Vectoriales',           claves: ['paludismo', 'malaria'] },
  { codigo: 'SAR',  nombre: 'Sarampión',                       modalidad: 'inmediata', grupo: 'Inmunoprevenibles',     claves: ['sarampion'] },
  { codigo: 'RUB',  nombre: 'Rubéola',                         modalidad: 'inmediata', grupo: 'Inmunoprevenibles',     claves: ['rubeola'] },
  { codigo: 'COQ',  nombre: 'Coqueluche (Tos convulsa)',       modalidad: 'inmediata', grupo: 'Inmunoprevenibles',     claves: ['coqueluche', 'tos convulsa', 'pertussis'] },
  { codigo: 'TET',  nombre: 'Tétanos',                         modalidad: 'inmediata', grupo: 'Inmunoprevenibles',     claves: ['tetanos'] },
  { codigo: 'DIF',  nombre: 'Difteria',                        modalidad: 'inmediata', grupo: 'Inmunoprevenibles',     claves: ['difteria'] },
  { codigo: 'MEN',  nombre: 'Meningitis / Meningoencefalitis', modalidad: 'inmediata', grupo: 'Neurológicas',          claves: ['meningitis', 'meningoencefalitis', 'meningococo', 'meningococica'] },
  { codigo: 'TBC',  nombre: 'Tuberculosis',                    modalidad: 'semanal',   grupo: 'Respiratorias',         claves: ['tuberculosis', 'tbc', 'bacilo de koch'] },
  { codigo: 'COL',  nombre: 'Cólera',                          modalidad: 'inmediata', grupo: 'Hídricas/Alimentarias', claves: ['colera'] },
  { codigo: 'BOT',  nombre: 'Botulismo',                       modalidad: 'inmediata', grupo: 'Hídricas/Alimentarias', claves: ['botulismo'] },
  { codigo: 'HAN',  nombre: 'Hantavirus',                      modalidad: 'inmediata', grupo: 'Zoonóticas',            claves: ['hantavirus', 'hanta'] },
  { codigo: 'LEP',  nombre: 'Leptospirosis',                   modalidad: 'inmediata', grupo: 'Zoonóticas',            claves: ['leptospirosis'] },
  { codigo: 'RAB',  nombre: 'Rabia',                           modalidad: 'inmediata', grupo: 'Zoonóticas',            claves: ['rabia'] },
  { codigo: 'CHA',  nombre: 'Chagas agudo',                    modalidad: 'inmediata', grupo: 'Zoonóticas',            claves: ['chagas'] },
  { codigo: 'HEP',  nombre: 'Hepatitis virales (A/B/C)',       modalidad: 'semanal',   grupo: 'Hepáticas',             claves: ['hepatitis a', 'hepatitis b', 'hepatitis c', 'hepatitis viral'] },
  { codigo: 'SIF',  nombre: 'Sífilis',                         modalidad: 'semanal',   grupo: 'ITS',                   claves: ['sifilis'] },
  { codigo: 'VIH',  nombre: 'VIH',                             modalidad: 'semanal',   grupo: 'ITS',                   claves: ['vih', 'hiv'] },
  { codigo: 'COV',  nombre: 'COVID-19',                        modalidad: 'inmediata', grupo: 'Respiratorias',         claves: ['covid', 'covid-19', 'sars-cov-2', 'coronavirus'] },
];

const normalizar = (texto = '') =>
  texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const escaparRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const contienePalabra = (texto, clave) => {
  const c = escaparRegex(normalizar(clave));
  return new RegExp(`(^|[^a-z0-9])${c}([^a-z0-9]|$)`, 'i').test(texto);
};

/**
 * Detecta si un texto clínico (diagnóstico, motivo, etc.) corresponde a una
 * patología de notificación obligatoria.
 * @param {string} textoClinico
 * @returns {object|null} la patología detectada o null si no aplica.
 */
export const detectarNotificacionObligatoria = (textoClinico) => {
  const texto = normalizar(textoClinico);
  if (!texto) return null;
  return (
    PATOLOGIAS_NOTIFICABLES.find((pat) =>
      pat.claves.some((clave) => contienePalabra(texto, clave))
    ) || null
  );
};

export default PATOLOGIAS_NOTIFICABLES;
