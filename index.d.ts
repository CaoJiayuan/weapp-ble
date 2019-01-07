import BaseBuffer from './buffer.js'

interface MsgResult {
    code: Number;
    errMsg: string;
}

interface ResultPromise extends Promise<MsgResult> {

}
interface Service {
    id: string;
    deviceId : string;
    getCharacteristics(): Promise<Characteristic[]>
}

interface Characteristic {
    uuid: string;
    serviceId: string;
    properties: {
        read: boolean,
        write: boolean,
        indicate: boolean,
        notify: boolean
    };
}

interface CharacteristicValue {
    value : ArrayBuffer;
    characteristicId: string
}

interface Device {
    id: string;
    name: string;
    connect() : ResultPromise;
    getServices(): Promise<Service[]>;
    getBandServices(): Promise<Service[]>;
    getWriteCharacteristic(): Promise<Characteristic>;
    getNotifyCharacteristic(): Promise<Characteristic>;
    notifying(): ResultPromise;
    notifyingFrom(char : Characteristic): ResultPromise;
    characteristicChanging(cb : (res: CharacteristicValue) => void): void;
    write(buffer : ArrayBuffer): ResultPromise;
    writeTo(char: Characteristic, buffer : ArrayBuffer): ResultPromise;
    readFrom(char: Characteristic): Promise<CharacteristicValue>
}

export interface Manager {
    open(onWaitingDevice ?: () => void, onReopen ?: () => void) : ResultPromise;
    close() : ResultPromise;
    discover(delay ?: Number): ResultPromise;
    getDevices(): Promise<Device[]>;
}

export interface Buffer extends BaseBuffer.Buffer {

}

export function ab2hex(buffer: ArrayBuffer) : string