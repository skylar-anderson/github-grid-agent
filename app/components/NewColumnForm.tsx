import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  FormControl,
  Select,
  TextInput,
  Textarea,
  Checkbox,
  Text,
} from '@primer/react';
import type { ColumnType, Option } from '../actions';

interface NewColumnFormProps {
  addNewColumn: (data: {
    title: string;
    instructions: string;
    type: ColumnType;
    options: Option[];
    multiple?: boolean;
  }) => void;
}

const NewColumnForm = React.memo(function NewColumnForm({ addNewColumn }: NewColumnFormProps) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [type, setType] = useState<ColumnType>('boolean');
  const [options, setOptions] = useState<string>('');
  const [multiple, setMultiple] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const optionsList: Option[] = options
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => ({ title: line.trim(), description: '' }));

    addNewColumn({
      title,
      instructions,
      type,
      options: optionsList,
      multiple,
    });

    // Reset form
    setTitle('');
    setInstructions('');
    setType('boolean');
    setOptions('');
    setMultiple(false);
  }, [addNewColumn, title, instructions, type, options, multiple]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const handleInstructionsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInstructions(e.target.value);
  }, []);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as ColumnType);
  }, []);

  const handleOptionsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOptions(e.target.value);
  }, []);

  const handleMultipleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMultiple(e.target.checked);
  }, []);

  const showOptions = type === 'select' || type === 'select-user';

  return (
    <Box as="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <FormControl required>
        <FormControl.Label>Column Title</FormControl.Label>
        <TextInput value={title} onChange={handleTitleChange} />
      </FormControl>

      <FormControl required sx={{ mt: 3 }}>
        <FormControl.Label>Instructions</FormControl.Label>
        <Textarea
          value={instructions}
          onChange={handleInstructionsChange}
          placeholder="Instructions for what this column should contain..."
        />
      </FormControl>

      <FormControl required sx={{ mt: 3 }}>
        <FormControl.Label>Column Type</FormControl.Label>
        <Select value={type} onChange={handleTypeChange}>
          <Select.Option value="boolean">Boolean (Yes/No)</Select.Option>
          <Select.Option value="select">Select from options</Select.Option>
          <Select.Option value="select-user">Select GitHub user</Select.Option>
          <Select.Option value="text">Text</Select.Option>
          <Select.Option value="file">GitHub file</Select.Option>
          <Select.Option value="commit">Git commit</Select.Option>
        </Select>
      </FormControl>

      {showOptions && (
        <>
          <FormControl sx={{ mt: 3 }}>
            <FormControl.Label>Options (one per line)</FormControl.Label>
            <Textarea
              value={options}
              onChange={handleOptionsChange}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
            />
          </FormControl>

          <FormControl sx={{ mt: 3 }}>
            <Checkbox
              checked={multiple}
              onChange={handleMultipleChange}
            />
            <FormControl.Label sx={{ ml: 2 }}>
              <Text>Allow multiple selections</Text>
            </FormControl.Label>
          </FormControl>
        </>
      )}

      <Button type="submit" variant="primary" sx={{ mt: 3, width: '100%' }}>
        Add Column
      </Button>
    </Box>
  );
});

export default NewColumnForm;
