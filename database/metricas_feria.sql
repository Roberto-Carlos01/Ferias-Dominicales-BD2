USE bdferias;

DROP PROCEDURE IF EXISTS sp_metricas_clave_feria;
DELIMITER $$
CREATE PROCEDURE sp_metricas_clave_feria(IN p_idferia INT)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM FERIA WHERE IDFERIA = p_idferia) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La feria indicada no existe';
    END IF;

    SELECT
        f.IDFERIA,
        f.NOMBRE AS FERIA,
        (SELECT COUNT(*)
         FROM STAND s
         WHERE s.IDFERIA = f.IDFERIA) AS TOTAL_STANDS,
        (SELECT COUNT(*)
         FROM STAND s
         WHERE s.IDFERIA = f.IDFERIA
           AND (
               LOWER(TRIM(COALESCE(s.ESTADO, ''))) = 'ocupado'
               OR EXISTS (
                   SELECT 1
                   FROM CONFORMAN c
                   WHERE c.IDFERIA = s.IDFERIA
                     AND c.NROSTAND = s.NROSTAND
               )
           )) AS STANDS_OCUPADOS,
        (SELECT COUNT(DISTINCT c.CIEXPOSITOR)
         FROM CONFORMAN c
         WHERE c.IDFERIA = f.IDFERIA) AS TOTAL_EXPOSITORES,
        (SELECT COALESCE(SUM(p.CANTIDAD), 0.00)
         FROM PATROCINA p
         WHERE p.IDFERIA = f.IDFERIA) AS MONTO_TOTAL_PATROCINIO
    FROM FERIA f
    WHERE f.IDFERIA = p_idferia;
END$$
DELIMITER ;


DROP FUNCTION IF EXISTS fn_porcentaje_ocupacion_feria;
DELIMITER $$
CREATE FUNCTION fn_porcentaje_ocupacion_feria(p_idferia INT)
RETURNS DECIMAL(5,2)
READS SQL DATA
BEGIN
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_ocupados INT DEFAULT 0;

    SELECT COUNT(*),
           COALESCE(SUM(
               CASE
                   WHEN LOWER(TRIM(COALESCE(s.ESTADO, ''))) = 'ocupado'
                        OR EXISTS (
                            SELECT 1
                            FROM CONFORMAN c
                            WHERE c.IDFERIA = s.IDFERIA
                              AND c.NROSTAND = s.NROSTAND
                        )
                   THEN 1 ELSE 0
               END
           ), 0)
    INTO v_total, v_ocupados
    FROM STAND s
    WHERE s.IDFERIA = p_idferia;

    IF v_total = 0 THEN
        RETURN 0.00;
    END IF;

    RETURN ROUND((v_ocupados * 100.00) / v_total, 2);
END$$
DELIMITER ;


DROP FUNCTION IF EXISTS fn_monto_patrocinio_feria;
DELIMITER $$
CREATE FUNCTION fn_monto_patrocinio_feria(p_idferia INT)
RETURNS DECIMAL(14,2)
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(14,2) DEFAULT 0.00;

    SELECT COALESCE(SUM(CANTIDAD), 0.00)
    INTO v_total
    FROM PATROCINA
    WHERE IDFERIA = p_idferia;

    RETURN v_total;
END$$
DELIMITER ;