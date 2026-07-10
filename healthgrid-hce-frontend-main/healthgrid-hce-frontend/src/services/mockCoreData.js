// src/services/mockCoreData.js

export const corePacientesMock = [
  {
    core_patient_id: "core-001",
    nombreApellido: "Juan Perez",
    dni: "30123456",
    fechaNacimiento: "1985-05-15",
    sexo: "Masculino",
    telefono: "11-4567-8901",
    direccion: "Av. Siempre Viva 123"
  },
  {
    core_patient_id: "core-002",
    nombreApellido: "Maria Gonzalez",
    dni: "28987654",
    fechaNacimiento: "1980-11-20",
    sexo: "Femenino",
    telefono: "11-9876-5432",
    direccion: "Calle Falsa 123"
  },
  {
    core_patient_id: "core-003",
    nombreApellido: "Carlos Rodriguez",
    dni: "40111222",
    fechaNacimiento: "1998-03-10",
    sexo: "Masculino",
    telefono: "11-2222-3333",
    direccion: "Av. Corrientes 456"
  },
  {
    core_patient_id: "core-004",
    nombreApellido: "Laura Fernandez",
    dni: "35444555",
    fechaNacimiento: "1990-07-22",
    sexo: "Femenino",
    telefono: "11-4444-5555",
    direccion: "Calle San Martin 789"
  },
  {
    core_patient_id: "core-005",
    nombreApellido: "Diego Martinez",
    dni: "42666777",
    fechaNacimiento: "2001-01-05",
    sexo: "Masculino",
    telefono: "11-6666-7777",
    direccion: "Av. Belgrano 1011"
  }
];

export const searchCorePatients = (query) => {
  const term = (query || '').toLowerCase().trim();
  if (!term) return corePacientesMock;
  
  return corePacientesMock.filter(p => 
    p.nombreApellido.toLowerCase().includes(term) ||
    p.dni.includes(term)
  );
};
