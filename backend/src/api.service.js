'use strict';

/**
 * CRUD genérico con consultas parametrizadas.
 * Cada ruta/controller instancia un ApiService indicando tabla y campos permitidos.
 */

class ApiService {
  /**
   * @param {object} config
   * @param {string} config.tabla     Nombre de la tabla
   * @param {string[]} config.campos  Columnas que se pueden escribir
   * @param {string} [config.pk]      Clave primaria (por defecto 'id')
   * @param {object} [config.db]
   */
  constructor({ tabla, campos = [], pk = 'id', db }) {
    if (!tabla || !/^[a-z_][a-z0-9_]*$/i.test(tabla)) {
      throw new Error(`Nombre de tabla no permitido: ${tabla}`);
    }
    this.tabla = tabla;
    this.campos = campos;
    this.pk = pk;
    this.db = db;
  }

  /** Base de datos: la compartida o una inyectada. */
  get bd() {
    if (this.db) return this.db;
    // eslint-disable-next-line global-require
    return require('./db').obtener();
  }

  /** Filtra los datos dejando solo las columnas permitidas. */
  soloCampos(datos) {
    const limpio = {};
    for (const campo of Object.keys(datos)) {
      if (this.campos.includes(campo)) limpio[campo] = datos[campo];
    }
    return limpio;
  }

  /** Valida que un identificador de columna sea seguro. */
  columna(nombre) {
    if (typeof nombre !== 'string' || !/^[a-z_][a-z0-9_]*$/i.test(nombre)) {
      throw new Error(`Columna no permitida: ${nombre}`);
    }
    return nombre;
  }

  /**
   * Lista registros.
   * @param {{columna:string, operacion:string, valor:any}[]} [filtros]
   * @param {{orden?:string, limite?:number}} [opciones]
   */
  async todos(filtros = [], opciones = {}) {
    const donde = [];
    const params = {};

    filtros.forEach((filtro, i) => {
      donde.push(`${this.columna(filtro.columna)} ${filtro.operacion || '='} @p${i}`);
      params[`p${i}`] = filtro.valor;
    });

    let sql = `SELECT * FROM ${this.tabla}`;
    if (donde.length) sql += ` WHERE ${donde.join(' AND ')}`;

    if (opciones.orden) {
      const campos = opciones.orden
        .split(',')
        .map((trozo) => {
          const piezas = trozo.trim().split(/\s+/);
          const columna = this.columna(piezas[0]);
          const direccion = (piezas[1] ?? 'ASC').toUpperCase();
          return `${columna} ${direccion === 'DESC' ? 'DESC' : 'ASC'}`;
        })
        .join(', ');
      sql += ` ORDER BY ${campos}`;
    }
    if (opciones.limite) sql += ` LIMIT ${Number(opciones.limite)}`;

    return this.bd.prepare(sql).all(params);
  }

  /** Registros que cumplen todos los filtros. */
  async porCriterios(filtros = [], opciones = {}) {
    return this.todos(filtros, opciones);
  }

  /** Un registro por clave primaria. */
  async porId(id) {
    return this.bd.prepare(`SELECT * FROM ${this.tabla} WHERE ${this.pk} = ?`).get(id);
  }

  /** Cuenta registros (opcionalmente filtrados). */
  async contar(filtros = []) {
    const donde = [];
    const params = {};
    filtros.forEach((filtro, i) => {
      donde.push(`${this.columna(filtro.columna)} ${filtro.operacion || '='} @p${i}`);
      params[`p${i}`] = filtro.valor;
    });
    const sql = `SELECT COUNT(*) AS total FROM ${this.tabla}${donde.length ? ` WHERE ${donde.join(' AND ')}` : ''}`;
    return (await this.bd.prepare(sql).get(params)).total;
  }

  /** Inserta un registro y devuelve su id. */
  async crear(datos) {
    const limpio = this.soloCampos(datos);
    const columnas = Object.keys(limpio);
    if (!columnas.length) throw new Error('No se enviaron campos válidos');

    const valores = columnas.map((columna) => `@${columna}`);
    const info = await this.bd
      .prepare(
        `INSERT INTO ${this.tabla} (${columnas.join(', ')}) VALUES (${valores.join(', ')})`,
      )
      .run(limpio);

    return Number(info.lastInsertRowid);
  }

  /** Actualiza por clave primaria. Devuelve true si cambió algo. */
  async actualizar(id, datos) {
    const limpio = this.soloCampos(datos);
    const columnas = Object.keys(limpio);
    if (!columnas.length) return false;

    const asignaciones = columnas.map((columna) => `${columna} = @${columna}`);
    const info = await this.bd
      .prepare(`UPDATE ${this.tabla} SET ${asignaciones.join(', ')} WHERE ${this.pk} = @id`)
      .run({ ...limpio, id });

    return info.changes > 0;
  }

  /** Elimina por clave primaria. */
  async eliminar(id) {
    return (await this.bd.prepare(`DELETE FROM ${this.tabla} WHERE ${this.pk} = ?`).run(id)).changes > 0;
  }
}

module.exports = { ApiService };