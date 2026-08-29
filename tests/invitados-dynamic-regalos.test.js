const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(__dirname, '..', 'invitados.json');
const invitados = JSON.parse(fs.readFileSync(filePath, 'utf8'));

assert.ok(Object.keys(invitados).length > 0, 'Debe existir al menos un invitado.');

for (const [codigo, invitado] of Object.entries(invitados)) {
  assert.ok('qr' in invitado, `Falta la propiedad qr para ${codigo}.`);
  assert.ok(Array.isArray(invitado.pagos), `Falta la propiedad pagos para ${codigo}.`);
  assert.ok(invitado.pagos.length >= 2, `Cada invitado debe tener al menos dos cuentas para pagos.`);

  invitado.pagos.forEach((pago) => {
    assert.ok(pago.nombre, `Falta nombre en pago del invitado ${codigo}.`);
    assert.ok(pago.numeroCuenta, `Falta numeroCuenta en pago del invitado ${codigo}.`);
    assert.ok(typeof pago.qr === 'string' && pago.qr.trim().length > 0, `Falta qr en pago del invitado ${codigo}.`);
  });
}

console.log(`Validación OK: ${Object.keys(invitados).length} invitados con pagos dinámicos.`);
