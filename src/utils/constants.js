const ROLES = Object.freeze({ ADMIN: 'ADMIN', OPERATEUR: 'OPERATEUR'});

const ORDER_STATUS = Object.freeze({
    PLANNED: 'PLANNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
});

const MOVEMENT_TYPE = Object.freeze({ENTRY: 'ENTRY', EXIT: 'EXIT'});

module.exports = { ROLES, ORDER_STATUS, MOVEMENT_TYPE };