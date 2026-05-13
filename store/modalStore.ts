import { create } from "zustand";

type ModalState = {
  createModal: boolean;
  editModal: boolean;

  handleCreateModal: (open: boolean) => void;
  handleEditModal: (open: boolean) => void;
};

export const useModalStore = create<ModalState>((set) => ({
  createModal: false,
  editModal: false,

  handleCreateModal: (open: boolean) => set({ createModal: open }),
  handleEditModal: (open: boolean) => set({ editModal: open }),
}));
