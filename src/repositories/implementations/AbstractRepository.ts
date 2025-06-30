import {DatabaseConnection} from "../../infrastructure/database/sqlite/DatabaseConnection";

export abstract class AbstractRepository {
    protected readonly dbConnection: DatabaseConnection;

    protected constructor() {
        this.dbConnection = DatabaseConnection.getInstance();
    }
}