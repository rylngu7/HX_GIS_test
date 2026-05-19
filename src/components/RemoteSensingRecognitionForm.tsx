
import React, { useState } from 'react';
import FormField, { InputField, SelectField } from './FormField';

interface RecognitionFormProps {
  type: string;
}

const algorithmOptions = [
  { value: 'yolov8', label: 'YOLOv8' },
  { value: 'unet', label: 'U-Net' },
  { value: 'deeplabv3', label: 'DeepLabV3' },
  { value: 'fcn', label: 'FCN' },
  { value: 'maskrcnn', label: 'Mask R-CNN' }
];

const layerOptions = [
  { value: 'image1', label: '影像数据-1.tif' },
  { value: 'image2', label: '影像数据-2.tif' },
  { value: 'image3', label: '多光谱合成.tif' },
  { value: 'image4', label: '高光谱数据.tif' }
];

const RemoteSensingRecognitionForm: React.FC<RecognitionFormProps> = ({ type }) => {
  const [resultName, setResultName] = useState(type);
  const [selectedLayer, setSelectedLayer] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');

  return (
    <div className="space-y-1">
      <FormField label="结果名称" required>
        <InputField 
          value={resultName} 
          onChange={setResultName} 
          maxLength={20}
        />
      </FormField>

      <FormField label="图层数据" required helpIcon>
        <SelectField 
          value={selectedLayer} 
          onChange={setSelectedLayer} 
          options={layerOptions} 
        />
      </FormField>

      <FormField label="目标算法模型" required>
        <SelectField 
          value={selectedAlgorithm} 
          onChange={setSelectedAlgorithm} 
          options={[
            { value: '', label: '请选择' },
            ...algorithmOptions
          ]} 
        />
      </FormField>

      <div className="p-3 bg-gray-50 rounded-md">
        <div className="text-sm text-gray-600">{type}</div>
      </div>
    </div>
  );
};

export default RemoteSensingRecognitionForm;
