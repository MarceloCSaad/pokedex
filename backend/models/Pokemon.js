module.exports = class Pokemon {
    constructor (name, id, icon, sprite, types) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.sprite = sprite;
        this.types = types;
    }
}