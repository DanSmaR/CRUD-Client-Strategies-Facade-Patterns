"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressType = exports.StreetType = exports.ResidenceType = void 0;
var ResidenceType;
(function (ResidenceType) {
    ResidenceType["CASA"] = "casa";
    ResidenceType["APARTAMENTO"] = "apartamento";
    ResidenceType["CONDOMINIO"] = "condominio";
    ResidenceType["CHACARA"] = "chacara";
    ResidenceType["SOBRADO"] = "sobrado";
    ResidenceType["OUTRO"] = "outro";
})(ResidenceType || (exports.ResidenceType = ResidenceType = {}));
var StreetType;
(function (StreetType) {
    StreetType["RUA"] = "rua";
    StreetType["AVENIDA"] = "avenida";
    StreetType["TRAVESSA"] = "travessa";
    StreetType["ALAMEDA"] = "alameda";
    StreetType["PRACA"] = "praca";
    StreetType["ESTRADA"] = "estrada";
    StreetType["RODOVIA"] = "rodovia";
    StreetType["OUTRO"] = "outro";
})(StreetType || (exports.StreetType = StreetType = {}));
var AddressType;
(function (AddressType) {
    AddressType["RESIDENCIAL"] = "residencial";
    AddressType["COBRANCA"] = "cobranca";
    AddressType["ENTREGA"] = "entrega";
})(AddressType || (exports.AddressType = AddressType = {}));
