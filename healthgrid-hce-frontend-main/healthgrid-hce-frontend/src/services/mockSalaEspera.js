// src/services/mockSalaEspera.js
import { corePacientesMock } from './mockCoreData';

const ID_PROFESIONAL_ACTUAL = "prof-001";

// Cargar estado inicial desde localStorage o usar mocks por defecto
const inicializarSalaEspera = () => {
  const saved = localStorage.getItem('healthgrid_sala_espera');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parseando healthgrid_sala_espera del localStorage", e);
    }
  }

  // Valores por defecto
  return [
    {
      id_espera: 101,
      id_paciente: "core-001", 
      nombreApellido: "Juan Perez",
      dni: "30123456",
      tipo_atencion: "Consultorio",
      sector: "Cardiología",
      hora_llegada: new Date(new Date().setHours(8, 15)).toISOString(),
      horario_turno: new Date(new Date().setHours(8, 30)).toISOString(),
      motivo: "-",
      estado: "En espera",
      id_turno_externo: 5001,
      id_profesional: ID_PROFESIONAL_ACTUAL,
      nivel_triage: "Verde",
      id_enfermero_triage: null
    },
    {
      id_espera: 102,
      id_paciente: "core-002", 
      nombreApellido: "Maria Gonzalez",
      dni: "28987654",
      tipo_atencion: "Guardia",
      sector: "Clínica Médica",
      hora_llegada: new Date(new Date().setHours(9, 5)).toISOString(),
      horario_turno: null, // Orden de llegada
      motivo: "-",
      estado: "En espera",
      id_turno_externo: null,
      id_profesional: ID_PROFESIONAL_ACTUAL,
      nivel_triage: "Verde",
      id_enfermero_triage: null
    },
    {
      id_espera: 103,
      id_paciente: "core-003", 
      nombreApellido: "Carlos Rodriguez",
      dni: "40111222",
      tipo_atencion: "Consultorio",
      sector: "Clínica Médica",
      hora_llegada: new Date(new Date().setHours(9, 45)).toISOString(),
      horario_turno: new Date(new Date().setHours(10, 0)).toISOString(),
      motivo: "-",
      estado: "En espera",
      id_turno_externo: 5003,
      id_profesional: ID_PROFESIONAL_ACTUAL,
      nivel_triage: "Verde",
      id_enfermero_triage: null
    },
    {
      id_espera: 104,
      id_paciente: "core-004", 
      nombreApellido: "Laura Fernandez",
      dni: "35444555",
      tipo_atencion: "Guardia",
      sector: "Traumatología",
      hora_llegada: new Date(new Date().setHours(10, 15)).toISOString(),
      horario_turno: null, // Guardia (orden de llegada)
      motivo: "Esguince de tobillo",
      estado: "En espera",
      id_turno_externo: null,
      id_profesional: ID_PROFESIONAL_ACTUAL,
      nivel_triage: "Amarillo",
      id_enfermero_triage: null
    }
  ];
};

export let salaEsperaMock = inicializarSalaEspera();

const guardarSalaEspera = () => {
  localStorage.setItem('healthgrid_sala_espera', JSON.stringify(salaEsperaMock));
};

// Función para obtener la agenda del día
export const getAgendaDelDia = (idProfesional) => {
  return salaEsperaMock
    .filter(turno => turno.id_profesional === idProfesional)
    .map(turno => {
      // Si el Módulo 2 ya nos manda nombre y DNI, los usamos, si no hacemos JOIN fallback
      const pacienteInfo = corePacientesMock.find(p => p.core_patient_id === turno.id_paciente);
      return {
        ...turno,
        paciente: {
          core_patient_id: turno.id_paciente,
          nombreApellido: turno.nombreApellido || pacienteInfo?.nombreApellido || 'Desconocido',
          dni: turno.dni || pacienteInfo?.dni || '—'
        }
      };
    })
    .sort((a, b) => {
      // Si no hay horario de turno (ej. guardia), usa hora de llegada para ordenar
      const timeA = a.horario_turno ? new Date(a.horario_turno) : new Date(a.hora_llegada);
      const timeB = b.horario_turno ? new Date(b.horario_turno) : new Date(b.hora_llegada);
      return timeA - timeB;
    });
};

export const actualizarEstadoTurno = (id_espera, nuevoEstado, consultorio = null) => {
  const turno = salaEsperaMock.find(t => t.id_espera === id_espera);
  if (turno) {
    turno.estado = nuevoEstado;
    if (consultorio !== null) {
      turno.consultorio = consultorio;
    }
    guardarSalaEspera();
  }
};

