import type { Request, Response } from "express";
import * as logService from "../services/log.service.ts"

export async function createLog(req: Request, res: Response){
    // validation des données
    await logService.createLog(req.body);

    res.status(201).json( {message : "Log crée avec succés"} );
};

export async function getLogs(req: Request, res: Response) {
        // validation des données
    // await logService.createLog(req.body);

    const logs = await logService.getLogs();

    res.json({
        data: logs,

    });
}