import { create } from "zustand";

type ModalState = {
  isOpen: boolean;
  handleModal: (open: boolean) => void;
};

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,

  handleModal: (open: boolean) => set(() => ({ isOpen: open })),
}));
