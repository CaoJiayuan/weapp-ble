import BaseBuffer from './buffer.js'

interface MsgResult {
    code: Number;
    errMsg: string;
}

interface DeviceMeta {
    name ?: string;
    deviceId: string;
    RSSI ?: Number;
    advertisData ?: ArrayBuffer;
    advertisServiceUUIDs ?: string[];
    localName ?: string;
    serviceData ?: object;
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

export interface DeviceInstance {
    id: string;
    name: string;
    meta: DeviceMeta;
    connect() : ResultPromise;
    disconnect() : ResultPromise;
    getServices(): Promise<Service[]>;
    getBandServices(): Promise<Service[]>;
    getWriteCharacteristic(): Promise<Characteristic>;
    getNotifyCharacteristic(): Promise<Characteristic>;
    notifying(): ResultPromise;
    notifyingFrom(char : Characteristic): ResultPromise;
    characteristicChanging(cb : (res: CharacteristicValue) => void): void;
    write(buffer : ArrayBuffer): ResultPromise;
    writeTo(char: Characteristic, buffer : ArrayBuffer): ResultPromise;
    readFrom(char: Characteristic): Promise<CharacteristicValue>;
    new (meta : DeviceMeta): DeviceInstance
}

declare interface ManagerInstance {
    opened: boolean;
    open(onWaitingDevice ?: () => void, onReopen ?: () => void) : ResultPromise;
    close() : ResultPromise;
    discover(delay ?: Number): ResultPromise;
    getDevices(): Promise<DeviceInstance[]>;
    new(): ManagerInstance
}

export interface Buffer extends BaseBuffer.Buffer {

}

export const Manager : ManagerInstance;
export const Device : DeviceInstance;

export function ab2hex(buffer: ArrayBuffer) : string