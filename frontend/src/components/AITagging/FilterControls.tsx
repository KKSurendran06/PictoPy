import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { Button } from '../ui/button';
import { MediaItem } from '@/types/Media';
import FolderPicker from '../FolderPicker/FolderPicker';
import { useAddFolder } from '@/hooks/AI_Image';
import LoadingScreen from '../ui/LoadingScreen/LoadingScreen';
import { ListOrderedIcon } from '../ui/Icons/Icons';
import DeleteSelectedImagePage from '../FolderPicker/DeleteSelectedImagePage';
import ErrorDialog from '../Album/Error';

interface FilterControlsProps {
  filterTag: string;
  setFilterTag: (tag: string) => void;
  mediaItems: MediaItem[];
  onFolderAdded: () => Promise<void>;
  isLoading: boolean;
  isVisibleSelectedImage: boolean;
  setIsVisibleSelectedImage: (value: boolean) => void;
  refetchMediaItems: () => Promise<void>;
}

export default function FilterControls({
  filterTag,
  setFilterTag,
  mediaItems,
  onFolderAdded,
  refetchMediaItems,
  isLoading,
  isVisibleSelectedImage,
  setIsVisibleSelectedImage,
}: FilterControlsProps) {
  const {
    addFolder,
    isLoading: isAddingFolder,
    error: addFolderError,
  } = useAddFolder();

  const uniqueTags = React.useMemo(() => {
    const allTags = mediaItems.flatMap((item) => item.tags);
    return Array.from(new Set(allTags))
      .filter((tag): tag is string => typeof tag === 'string')
      .sort();
  }, [mediaItems]);

  const handleFolderPick = async (path: string) => {
    try {
      await addFolder(path);
      await onFolderAdded();
      await refetchMediaItems();
    } catch (error) {
      console.error('Error adding folder:', error);
    }
  };

  const [errorDialogContent, setErrorDialogContent] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const showErrorDialog = (title: string, err: unknown) => {
    setErrorDialogContent({
      title,
      description:
        err instanceof Error ? err.message : 'An unknown error occurred',
    });
  };

  if (!isVisibleSelectedImage) {
    return (
      <div>
        <DeleteSelectedImagePage
          setIsVisibleSelectedImage={setIsVisibleSelectedImage}
          onError={showErrorDialog}
          refetchMediaItems={refetchMediaItems}
        />
      </div>
    );
  }

  return (
    <>
      {(isLoading || isAddingFolder) && <LoadingScreen />}
      {addFolderError && (
        <div className="text-red-500">Error: {addFolderError}</div>
      )}
      <div className="flex items-center gap-4 overflow-auto">
        <FolderPicker setFolderPath={handleFolderPick} />

        <Button
          onClick={() => setIsVisibleSelectedImage(false)}
          variant="outline"
        >
          Delete Image
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ListOrderedIcon className="h-4 w-4" />
              Filter by {filterTag || 'tags'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="max-h-[500px] w-[200px] overflow-y-auto bg-white dark:text-foreground"
            align="end"
          >
            <DropdownMenuRadioGroup
              className="overflow-auto"
              value={filterTag}
              onValueChange={setFilterTag}
            >
              <DropdownMenuRadioItem value="">All tags</DropdownMenuRadioItem>
              {uniqueTags.map((tag) => (
                <DropdownMenuRadioItem key={tag} value={tag}>
                  {tag}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <ErrorDialog
          content={errorDialogContent}
          onClose={() => setErrorDialogContent(null)}
        />
      </div>
    </>
  );
}
