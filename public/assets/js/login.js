/** Login: validacion en cliente y llamada a POST /api/auth/login. */

import { api } from './api.js';
import { panelDe, sesionActual } from './guardia.js';
import { mostrarAlerta } from './ui.js';

const formulario = document.getElementById('formulario');
const alerta = document.getElementById('alerta');
const boton = document.getElementById('btn-entrar');
const campoUsuario = document.getElementById('campo-usuario');
const campoClave = document.getElementById('campo-clave');
const usuario = document.getElementById('usuario');
const clave = document.getElementById('clave');

function validar() {
  let ok = true;

  const usuarioOk = usuario.value.trim().length >= 3;
  campoUsuario.classList.toggle('error', !usuarioOk);
  if (!usuarioOk) ok = false;

  const claveOk = clave.value.length >= 6;
  campoClave.classList.toggle('error', !claveOk);
  if (!claveOk) ok = false;

  return ok;
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mostrarAlerta(alerta, '');

  if (!validar()) {
    mostrarAlerta(alerta, 'Revise los datos marcados en rojo', 'error');
    return;
  }

  boton.disabled = true;
  boton.textContent = 'Verificando...';

  const r = await api('auth/login', {
    metodo: 'POST',
    cuerpo: { usuario: usuario.value.trim(), clave: clave.value },
  });

  boton.disabled = false;
  boton.textContent = 'Ingresar al sistema';

  if (!r.ok) {
    mostrarAlerta(alerta, r.mensaje, 'error');
    clave.value = '';
    clave.focus();
    return;
  }

  location.href = panelDe(r.datos.rol);
});

[usuario, clave].forEach((campo) => {
  campo.addEventListener('input', () => campo.parentElement.classList.remove('error'));
});

// Si ya hay sesion se va directo a su panel
sesionActual().then((sesion) => {
  if (sesion) location.replace(panelDe(sesion.rol));
});