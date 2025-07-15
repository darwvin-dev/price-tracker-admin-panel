import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  CircularProgress,
  IconButton,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import type { Category } from "../types/Category";

interface Props {
  selectedCategories: Category[];
  onChange: (categories: Category[]) => void;
}

const CategorySelector: React.FC<Props> = ({
  selectedCategories,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!inputValue.trim()) return;
    const controller = new AbortController();
    setLoading(true);

    axios
      .get(
        `${import.meta.env.VITE_API_URL}api/categories/?search=${inputValue}`,
        {
          signal: controller.signal,
        }
      )
      .then((res) => setOptions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [inputValue]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreating(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/categories/`,
        {
          name: newCategoryName.trim(),
        }
      );
      onChange([...selectedCategories, res.data]);
      setNewCategoryName("");
      setOpenDialog(false);
    } catch (err) {
      console.error("❌ Error creating category", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box minWidth={250}>
      <Autocomplete
        multiple
        value={selectedCategories}
        onChange={(_, value) => onChange(value)}
        options={options}
        getOptionLabel={(option) => option.name}
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "setDirection",
                enabled: true,
                phase: "beforeWrite",
                fn: ({ state }) => {
                  Object.assign(state.elements.popper.style, {
                    direction: "rtl",
                    textAlign: "right",
                  });
                },
              },
            ],
          },
        }}
        isOptionEqualToValue={(opt, val) => opt.id === val.id}
        filterSelectedOptions
        loading={loading}
        inputValue={inputValue}
        onInputChange={(_, value) => setInputValue(value)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="دسته‌بندی‌ها"
            placeholder="جستجو یا انتخاب دسته‌بندی..."
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              sx: { pr: 0 },
              endAdornment: (
                <>
                  <Tooltip title="افزودن دسته‌بندی جدید">
                    <IconButton
                      onClick={() => setOpenDialog(true)}
                      size="small"
                      edge="end"
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                  {loading && <CircularProgress size={20} sx={{ mx: 1 }} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        dir="rtl"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          افزودن دسته‌بندی جدید
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="نام دسته‌بندی"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            autoFocus
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            انصراف
          </Button>
          <Button
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim() || creating}
            variant="contained"
          >
            افزودن
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategorySelector;
