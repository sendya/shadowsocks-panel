/*! 
* DevExtreme (Vector Map)
* Version: 14.1.7
* Build date: Sep 22, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/
"use strict";
(function (global, undefined) {
    function parseShp(stream) {
        var timeStart = new Date(),
            header,
            errors = [],
            records = [],
            record;
        try {
            header = parseShpHeader(stream);
        }
        catch (e) {
            errors.push('Terminated: ' + e.message + ' / ' + e.description);
            return { errors: errors };
        }
        if (header.fileCode !== 9994) {
            errors.push('File code: ' + header.fileCode + ' / expected: 9994');
        }
        if (header.version !== 1000) {
            errors.push('File version: ' + header.version + ' / expected: 1000');
        }
        try {
            while (stream.position() < header.fileLength) {
                record = parseShpRecord(stream, header.shapeType, errors);
                if (record) {
                    records.push(record);
                }
                else {
                    errors.push('Terminated');
                    break;
                }
            }
            if (stream.position() !== header.fileLength) {
                errors.push('File length: ' + header.fileLength + ' / actual: ' + stream.position());
            }
        }
        catch (e) {
            errors.push('Terminated: ' + e.message + ' / ' + e.description);
        }
        finally {
            return {
                bbox: [header.bbox.xmin, header.bbox.ymin, header.bbox.xmax, header.bbox.ymax],
                type: SHP_TYPES[header.shapeType],
                shapes: records,
                errors: errors,
                time: new Date() - timeStart
            };
        }
    }
    
    function parseShpHeader(stream) {
        return {
            fileCode: stream.uint32(true),
            unused1: stream.uint32(true),
            unused2: stream.uint32(true),
            unused3: stream.uint32(true),
            unused4: stream.uint32(true),
            unused5: stream.uint32(true),
            fileLength: stream.uint32(true) << 1,
            version: stream.uint32(),
            shapeType: stream.uint32(),
            bbox: {
                xmin: stream.float64(),
                ymin: stream.float64(),
                xmax: stream.float64(),
                ymax: stream.float64(),
                zmin: stream.float64(),
                zmax: stream.float64(),
                mmin: stream.float64(),
                mmax: stream.float64()
            }
        };
    }
    
    var SHP_TYPES = {};
    SHP_TYPES[0] = 'Null';
    SHP_TYPES[1] = 'Point';
    SHP_TYPES[3] = 'Polyline';
    SHP_TYPES[5] = 'Polygon';
    SHP_TYPES[8] = 'MultiPoint';
    
    var SHP_RECORD_PARSERS = {};
    SHP_RECORD_PARSERS[0] = parseNull;
    SHP_RECORD_PARSERS[1] = parsePoint;
    SHP_RECORD_PARSERS[8] = parseMultiPoint;
    SHP_RECORD_PARSERS[3] = parsePolygon;
    SHP_RECORD_PARSERS[5] = parsePolygon;
    
    function parseShpRecord(stream, shapeType, errors) {
        var record = {};
        record.number = stream.uint32(true);
        var length = stream.uint32(true) << 1;
        var start = stream.position();
        record.shapeType = stream.uint32();
        record.shapeName = SHP_TYPES[record.shapeType];
        if (!record.shapeName) {
            errors.push('Shape #' + record.number + ' type: ' + record.shapeType + ' / unknown');
            return null;
        }
        if (record.shapeType !== shapeType) {
            errors.push('Shape #' + record.number + ' type: ' + record.shapeName + ' / expected: ' + SHP_TYPES[shapeType]);
        }
        SHP_RECORD_PARSERS[record.shapeType](stream, record);
        var end = stream.position();
        if (end - start !== length) {
            errors.push('Shape #' + record.number + ' length: ' + length + ' / actual: ' + end - start);
        }
        return record;
    }
    
    function parseNull() { }
    
    function parsePoint(stream, record) {
        record.coordinates = [stream.float64(), stream.float64()];
    }
    
    function parseMultiPoint(stream, record) {
        var bbox = [stream.float64(), stream.float64(), stream.float64(), stream.float64()],
            numPoints = stream.uint32(),
            points = [],
            i;
        for (i = 0; i < numPoints; ++i) {
            points.push([stream.float64(), stream.float64()]);
        }
        record.bbox = bbox;
        record.coordinates = points;
    }
    
    function parsePolygon(stream, record) {
        var bbox = [stream.float64(), stream.float64(), stream.float64(), stream.float64()],
            numParts = stream.uint32(),
            numPoints = stream.uint32(),
            parts = [],
            points = [],
            i, k, kk,
            rings = [], ring;
        for (i = 0; i < numParts; ++i) {
            parts.push(stream.uint32());
        }
        for (i = 0; i < numPoints; ++i) {
            points.push([stream.float64(), stream.float64()]);
        }
        for (i = 0; i < numParts; ++i) {
            k = parts[i];
            kk = parts[i + 1] || numPoints;
            ring = [];
            for (k = parts[i], kk = parts[i + 1] || numPoints; k < kk; ++k) {
                ring.push(points[k]);
            }
            rings.push(ring);
        }
        record.bbox = bbox;
        record.coordinates = rings;
    }
    
    function parseDbf(stream) {
        var timeStart = new Date(), errors = [], header, parseData, records;
        try {
            header = parseDbfHeader(stream, errors);
            parseData = prepareDbfRecordParseData(header, errors);
            records = parseDbfRecords(stream, header.numberOfRecords, header.recordLength, parseData, errors);
        }
        catch (e) {
            errors.push('Terminated: ' + e.message + ' / ' + e.description);
        }
        finally {
            return { records: records, errors: errors, time: new Date() - timeStart };
        }
    }
    
    function parseDbfHeader(stream, errors) {
        var header = {
            versionNumber: stream.uint8(),
            lastUpdate: new Date(1900 + stream.uint8(), stream.uint8() - 1, stream.uint8()),
            numberOfRecords: stream.uint32(),
            headerLength: stream.uint16(),
            recordLength: stream.uint16()
        };
        stream.skip(20);
        var numberOfFields = (header.headerLength - stream.position() - 1) / 32;
        var fields = [];
        while (numberOfFields-- > 0) {
            fields.push(parseFieldDescriptor(stream));
        }
        header.fields = fields;
        var term = stream.uint8();
        if (term !== 13) {
            errors.push('Header terminator: ' + term + ' / expected: 13');
        }
        return header;
    }
    
    var _fromCharCode = String.fromCharCode;
    
    function getAsciiString(stream, length) {
        return _fromCharCode.apply(null, stream.uint8array(length));
    }
    
    var RE_TRAILING_ZEROS = /\0*$/gi;
    
    function parseFieldDescriptor(stream) {
        var desc = {
            name: getAsciiString(stream, 11).replace(RE_TRAILING_ZEROS, ''),
            type: _fromCharCode(stream.uint8()),
            length: stream.skip(4).uint8(),
            count: stream.uint8()
        };
        stream.skip(14);
        return desc;
    }
    
    var DBF_FIELD_PARSERS = {};
    DBF_FIELD_PARSERS._default = function (stream, length) {
        stream.skip(length);
        return null;
    };
    DBF_FIELD_PARSERS['C'] = function (stream, length) {
        var str = getAsciiString(stream, length);
        return str.trim();
    };
    DBF_FIELD_PARSERS['N'] = function (stream, length) {
        var str = getAsciiString(stream, length);
        return parseFloat(str, 10);
    };
    DBF_FIELD_PARSERS['D'] = function (stream, length) {
        var str = getAsciiString(stream, length);
        return new Date(str.substring(0, 4), str.substring(4, 6) - 1, str.substring(6, 8));
    };
    
    function prepareDbfRecordParseData(header, errors) {
        var list = [],
            i = 0, ii = header.fields.length,
            item, field,
            totalLength = 0;
        for (; i < ii; ++i) {
            field = header.fields[i];
            item = {
                name: field.name,
                parser: DBF_FIELD_PARSERS[field.type],
                length: field.length
            };
            if (!item.parser) {
                item.parser = DBF_FIELD_PARSERS._default;
                errors.push('Field ' + field.name + ' type: ' + field.type + ' / unknown');
            }
            totalLength += field.length;
            list.push(item);
        }
        if (totalLength + 1 !== header.recordLength) {
            errors.push('Record length: ' + header.recordLength + ' / actual: ' + (totalLength + 1));
        }
        return list;
    }
    
    function parseDbfRecords(stream, recordCount, recordLength, parseData, errors) {
        var i = 0, j, jj = parseData.length,
            start, end,
            records = [], record, pd;
        for (; i < recordCount; ++i) {
            record = {};
            start = stream.position();
            stream.skip(1);
            for (j = 0; j < jj; ++j) {
                pd = parseData[j];
                record[pd.name] = pd.parser(stream, pd.length);
            }
            end = stream.position();
            if (end - start !== recordLength) {
                errors.push('Record #' + (i + 1) + ' length: ' + recordLength + ' / actual: ' + end - start);
            }
            records.push(record);
        }
        return records;
    }
    
    var _round = Math.round;
    function adjustPrecision(stream, precision) {
        var _precision = 0 <= precision && precision <= 8 ? _round(precision) : 8,
            factor = Number('1E' + _precision),
            _float64 = stream.float64;
        stream.float64 = function () {
            var value = _float64.apply(this, arguments);
            return _round(value * factor) / factor;
        };
    }
    
    function parseCore(source, parameters) {
        source = source || {};
        parameters = parameters || {};
        var stream, parsedShp = {}, parsedDbf = {};
        if (source.shp) {
            stream = new Stream(source.shp);
            adjustPrecision(stream, parameters.precision || 4);
            parsedShp = parseShp(stream);
        }
        if (source.dbf) {
            stream = new Stream(source.dbf);
            parsedDbf = parseDbf(stream);
        }
        var errors = [].concat(parsedShp.errors || [], parsedDbf.errors || []);
        errors.length && (parameters.errors = errors);
        var shapes = parsedShp.shapes || [],
            records = parsedDbf.records || [],
            i = 0, ii = shapes.length >= records.length ? shapes.length : records.length,
            shape, record, features = [];
        for (; i < ii; ++i) {
            shape = shapes[i] || {};
            record = records[i];
            features.push({
                type: shape.shapeName || null,
                coordinates: shape.coordinates || null,
                attributes: record || null
            });
        }
        return features.length ? {
            bbox: parsedShp.bbox || null,
            type: parsedShp.type || null,
            features: features
        } : null;
    }
    
    function loadAndParse(source, parameters, callback) {
        source = source || {};
        var shpSource, dbfSource, errors = [],
            _callback = typeof callback === 'function' ? callback : (typeof parameters === 'function' ? parameters : null),
            _parameters = (typeof parameters === 'function' ? null : parameters) || {};
        function checkAndExecute() {
            if (shpSource !== undefined && dbfSource !== undefined) {
                var result = parseCore({ shp: shpSource, dbf: dbfSource }, _parameters);
                _callback && _callback(result, errors.length ? errors : null);
            }
        }
        if (source.shp) {
            sendRequest(String(source.shp), function (response, error) {
                shpSource = response;
                error && errors.push(error);
                checkAndExecute();
            });
        }
        else {
            shpSource = null;
        }
        if (source.dbf) {
            sendRequest(String(source.dbf), function (response, error) {
                dbfSource = response;
                error && errors.push(error);
                checkAndExecute();
            });
        }
        else {
            dbfSource = null;
        }
        checkAndExecute();
    }
    
    var RE_SHP_FILE_PATTERN = /\.shp$/i,
        RE_DBF_FILE_PATTERN = /\.dbf$/i;
    
    function parse(source, parameters, callback) {
        source = source || {};
        if (source.shp || source.dbf) {
            if ((typeof source.shp === 'string') || (typeof source.dbf === 'string')) {
                loadAndParse(source, parameters, callback);
            }
            else {
                return parseCore(source, parameters);
            }
        }
        else if (typeof source === 'string') {
            if (RE_SHP_FILE_PATTERN.test(source)) {
                loadAndParse({ shp: source }, parameters, callback);
            }
            else if (RE_DBF_FILE_PATTERN.test(source)) {
                loadAndParse({ dbf: source }, parameters, callback);
            }
            else {
                loadAndParse({ shp: source + '.shp', dbf: source + '.dbf' }, parameters, callback);
            }
        }
        else {
            return null;
        }
    }
    
    function Stream(arrayBuffer) {
        this._dataView = new DataView(arrayBuffer);
        this._position = 0;
    }
    
    Stream.prototype = {
        constructor: Stream,
    
        position: function () {
            return this._position;
        },
    
        skip: function (count) {
            this._position += count;
            return this;
        },
    
        uint8array: function (length) {
            var dv = this._dataView, i = 0, list = [];
            for (; i++ < length;) {
                list.push(dv.getUint8(this._position++));
            }
            return list;
        },
    
        uint8: function () {
            return this._dataView.getUint8(this._position++);
        },
    
        uint16: function (bigEndian) {
            var result = this._dataView.getUint16(this._position, !bigEndian);
            this._position += 2;
            return result;
        },
    
        uint32: function (bigEndian) {
            var result = this._dataView.getUint32(this._position, !bigEndian);
            this._position += 4;
            return result;
        },
    
        float64: function (bigEndian) {
            var result = this._dataView.getFloat64(this._position, !bigEndian);
            this._position += 8;
            return result;
        }
    };
    
    function sendRequest(url, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                var error = this.statusText === 'OK' ? null : this.statusText;
                callback(error ? null : this.response, error);
            }
        };
        request.open('GET', url);
        request.responseType = 'arraybuffer';
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.send(null);
    }
    
    var DX = global.DevExpress = global.DevExpress || {};
    (DX.viz = DX.viz || {}).vectormaputils = { parse: parse };
}(this));