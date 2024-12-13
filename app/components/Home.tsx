import { useState, useEffect, useMemo } from 'react';
import { Button, Box, Spinner, Link } from '@primer/react';
import './Grid.css';
import { useGridContext } from './GridContext';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import type { Grid } from './GridContext';

const shuffleArray = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function GridLoading() {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            fontSize: 2,
            fontWeight: 'semibold',
            textAlign: 'center',
            pb: 3,
          }}
        >
          Starting grid...
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Spinner size="medium" />
        </Box>
      </Box>
    </Box>
  );
}

const SuggestionItem = ({ children, onClick }: { children: string; onClick: () => void }) => (
  <Box
    sx={{
      px: 2,
      py: 0,
      height: '24px',
      border: 'none',
      backgroundColor: 'canvas.inset',
      borderRadius: '20px',
      color: 'fg.muted',
      fontSize: 0,
      cursor: 'pointer',
      fontWeight: '500',
      '&:hover': {
        color: 'fg.default',
      },
    }}
    as="button"
    onClick={onClick}
  >
    {children}
  </Box>
);

const GridItem = ({ id, title, subtitle }: { id: string; title: string; subtitle: string }) => (
  <NextLink href={`/grid/${id}`} passHref legacyBehavior>
    <Link style={{ textDecoration: 'none' }}>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          padding: 3,
          backgroundColor: 'canvas.default',
          display: 'flex',
          flexDirection: 'column',
          height: '120px',
          justifyContent: 'flex-end',
          transition: 'all 260ms ease-in-out',
          '&:hover': {
            textDecoration: 'none',
            boxShadow: '0 1px 6px rgba(0,0,0,0.16)',
            //boxShadow: '0 0 2px rgba(0,0,0,0.14), 0 1px 6px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.12)',
          },
        }}
      >
        <Box sx={{ fontSize: 1, fontWeight: 'bold', color: 'fg.default' }}>{title}</Box>
        <Box sx={{ fontSize: 0, color: 'fg.muted' }}>{subtitle}</Box>
      </Box>
    </Link>
  </NextLink>
);

function ExistingGrids({
  grids,
  _deleteGrid,
}: {
  grids: Grid[];
  deleteGrid: (id: string) => void;
}) {
  if (grids.length === 0) {
    return null;
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)', // Changed this line
          gap: 3,
        }}
      >
        {grids.map((grid) => (
          <GridItem
            key={grid.id}
            id={grid.id}
            title={grid.title}
            subtitle={`${grid.rowCount}x${grid.columnCount} · Created ${new Date(grid.createdAt).toLocaleDateString()}`}
          />
        ))}
      </Box>
    </Box>
  );
}

export default function Home() {
  const [state, setState] = useState<'empty' | 'loading' | 'done'>('empty');
  const [inputValue, setInputValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { inititializeGrid, getAllGrids, setCurrentGridId, deleteGrid } = useGridContext();
  const router = useRouter();

  const existingGrids = getAllGrids();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const gridId = searchParams.get('gridId');
    if (gridId) {
      setCurrentGridId(gridId);
      setState('done');
    }
  }, [setCurrentGridId]);

  async function createGrid(inputValue: string) {
    if (!inputValue) {
      alert('Please enter a value');
      return;
    }
    setState('loading');
    try {
      const newGridId = await inititializeGrid(inputValue);
      setState('done');
      router.push(`/grid/${newGridId}`);
    } catch (e: any) {
      setErrorMessage(e.message);
      setState('empty');
    }
  }

  const suggestions = [
    'Merged PRs in primer/design',
    'Open issues in primer/design',
    'The action list component in primer/react',
    'Closed PRs in vercel/swr',
    'Files from last merged PR in primer/react',
  ];

  const selectedSuggestions = useMemo(() => {
    return shuffleArray([...suggestions]).slice(0, 3);
  }, [suggestions]);

  if (state === 'loading') {
    return <GridLoading />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'canvas.inset',
        // backgroundImage:
        //   "linear-gradient(to right, #f3f3f3 1px, transparent 1px), linear-gradient(to bottom, #f3f3f3 1px, transparent 1px)",
        // backgroundSize: "8px 8px"
      }}
    >
      <Box sx={{ width: '740' }}>
        <Box
          as="h1"
          sx={{
            fontSize: 4,
            mb: 2,
            fontWeight: 'semibold',
            color: 'fg.default',
            width: '100',
            textAlign: 'center',
          }}
        >
          🕵🏻‍♂️ Grid Agent
        </Box>
        <Box as="p" sx={{ color: 'fg.muted', textAlign: 'center' }}>
          Build your grid. Just describe the data you want to see and let 🕵🏻‍♂️ Grid Agent do the rest.{' '}
          <a href="https://github.com/skylar-anderson/github-grid-agent">Source</a>
        </Box>
        <Box
          sx={{
            border: '1px solid',
            backgroundColor: 'canvas.default',
            p: 2,
            width: '100%',
            borderColor: 'border.default',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'flex-end',
            ':focus-within': {
              outline: '2px solid #0969da',
              outlineOffset: '-1px',
              transition: 'all 260ms ease-in-out',
            },
          }}
        >
          <textarea
            placeholder="Describe the data you want to see in the grid..."
            rows={4}
            value={inputValue}
            style={{
              border: 'none',
              boxShadow: 'none',
              fontFamily: 'sans-serif',
              outlineColor: 'transparent',
              outline: 'none !important',
              width: '100%',
            }}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) {
                  return; // Allow newline with shift+enter
                }
                e.preventDefault();
                createGrid(inputValue);
              }
            }}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              flex: 1,
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                flex: 1,
                alignItems: 'flex-start',
              }}
            >
              {selectedSuggestions.map((s) => (
                <SuggestionItem key={s} onClick={() => createGrid(s)}>
                  {s}
                </SuggestionItem>
              ))}
            </Box>
            <Button variant="default" onClick={() => createGrid(inputValue)}>
              Create
            </Button>
          </Box>
        </Box>

        {existingGrids.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                fontSize: 2,
                fontWeight: 'semibold',
                color: 'fg.muted',
                mb: 3,
              }}
            >
              Your grids
            </Box>
            <ExistingGrids grids={existingGrids} deleteGrid={deleteGrid} />
          </Box>
        )}

        <Box
          as="form"
          sx={{ width: '100%', display: 'flex', gap: 2, pt: 2, px: 0 }}
          onSubmit={() => createGrid(inputValue)}
        >
          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </Box>
      </Box>
    </Box>
  );
}
