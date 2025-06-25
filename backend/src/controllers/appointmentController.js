const prisma = require('../middlewares/prisma');

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { patient: true },
      orderBy: { date: 'asc' }
    });
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const data = req.body;
    const patient = await prisma.patient.findUnique({ where: { id: Number(data.patientId) } });
    if (!patient) {
      return res.status(400).json({ error: 'patientId ไม่ถูกต้อง หรือไม่มีในฐานข้อมูล' });
    }
    const appointment = await prisma.appointment.create({
      data: {
        patientId: Number(data.patientId),
        date: new Date(data.date),
        chemoRegimen: data.chemoRegimen,
        admitStatus: data.admitStatus,
        admitDate: data.admitDate ? new Date(data.admitDate) : undefined,
        dischargeDate: data.dischargeDate ? new Date(data.dischargeDate) : undefined,
        referHospital: data.referHospital || undefined,
        referDate: data.referDate ? new Date(data.referDate) : undefined,
        note: data.note || undefined,
      }
    });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.date) data.date = new Date(data.date);
    if (data.referDate) data.referDate = new Date(data.referDate);
    const appointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data
    });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { admitStatus, admitDate, dischargeDate } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: {
        admitStatus,
        admitDate: admitDate ? new Date(admitDate) : undefined,
        dischargeDate: dischargeDate ? new Date(dischargeDate) : undefined,
      }
    });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 