export abstract class DomainEntity {
    private _id?: string;
    private _createdAt?: Date;

    get id(): string | undefined {
        return this._id;
    }

    get createdAt(): Date | undefined {
        return this._createdAt;
    }

    // Setters
    set id(id: string | undefined) {
        this._id = id;
    }

    set createdAt(createdAt: Date | undefined) {
        this._createdAt = createdAt;
    }
}
