import React, { useMemo, memo } from "react"
import { Calendar, MapPin } from "lucide-react"

const CARD_HEIGHT = 100 // ước lượng để tính spacer
const GAP_HEIGHT = 40   // khoảng cách dọc giữa các tầng

const formatDate = (dateStr) => {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
  } catch {
    return ""
  }
}

const formatTime = (timeStr) => (timeStr ? timeStr.toString().slice(0, 5) : "")

// SVG connector dạng fork cho 2 child
const SvgConnector = ({ isLeftWinner, isRightWinner, width = "100%", height = 24 }) => {
  const colorDefault = "#cbd5e1" // slate-300
  const colorActive = "#10b981"  // emerald-500
  const strokeDefault = 2
  const strokeActive = 3

  return (
    <svg width={width} height={height} className="overflow-visible block">
      {/* stem từ parent xuống điểm fork */}
      <line
        x1="50%"
        y1="0"
        x2="50%"
        y2="50%"
        stroke={isLeftWinner || isRightWinner ? colorActive : colorDefault}
        strokeWidth={isLeftWinner || isRightWinner ? strokeActive : strokeDefault}
      />
      {/* nhánh trái */}
      <path
        d="M 50% 50% L 25% 50% L 25% 100%"
        fill="none"
        stroke={isLeftWinner ? colorActive : colorDefault}
        strokeWidth={isLeftWinner ? strokeActive : strokeDefault}
        className="transition-colors duration-300"
      />
      {/* nhánh phải */}
      <path
        d="M 50% 50% L 75% 50% L 75% 100%"
        fill="none"
        stroke={isRightWinner ? colorActive : colorDefault}
        strokeWidth={isRightWinner ? strokeActive : strokeDefault}
        className="transition-colors duration-300"
      />
    </svg>
  )
}

const MatchNode = ({ node, onMatchClick, officialMatchByNumber }) => {
  if (!node) return null

  const { match: m, children = [] } = node
  const officialMatch = officialMatchByNumber?.[m.matchNumber] || m
  const status = officialMatch.status ?? 0

  // Spacer node để cân cây nếu cần (đang không dùng vì spacer logic được xử lý ở AISchedule)
  if (node.isSpacer) {
    const spacerHeight = (node.missingRounds || 1) * (CARD_HEIGHT + GAP_HEIGHT)
    return <div style={{ height: spacerHeight, minWidth: "180px" }} aria-hidden="true" />
  }

  // Xác định child thắng đưa đội lên trận này
  let isLeftChildWinner = false
  let isRightChildWinner = false
  if (children.length === 2 && (officialMatch.classGroup1Id || officialMatch.classGroup2Id)) {
    const leftChildMatch =
      officialMatchByNumber?.[children[0].match.matchNumber] || children[0].match
    const rightChildMatch =
      officialMatchByNumber?.[children[1].match.matchNumber] || children[1].match

    if (
      leftChildMatch.winnerClassGroupId === officialMatch.classGroup1Id ||
      leftChildMatch.winnerClassGroupId === officialMatch.classGroup2Id
    ) {
      isLeftChildWinner = true
    }
    if (
      rightChildMatch.winnerClassGroupId === officialMatch.classGroup1Id ||
      rightChildMatch.winnerClassGroupId === officialMatch.classGroup2Id
    ) {
      isRightChildWinner = true
    }
  }

  const statusColors =
    status === 2
      ? "border-emerald-500 ring-1 ring-emerald-500 shadow-md"
      : status === 1
      ? "border-blue-500 ring-1 ring-blue-200"
      : "border-slate-300"

  const scoreText =
    officialMatch.score1 != null && officialMatch.score2 != null
      ? `${officialMatch.score1} - ${officialMatch.score2}`
      : "vs"

  return (
    <div className="flex flex-col-reverse items-center">
      {/* children rows */}
      {children.length > 0 && (
        <div className="flex flex-row justify-center gap-6 w-full">
          {children.map((child) => (
            <div key={child.match.matchNumber} className="flex flex-col items-center w-full">
              <MatchNode
                node={child}
                onMatchClick={onMatchClick}
                officialMatchByNumber={officialMatchByNumber}
              />
            </div>
          ))}
        </div>
      )}

      {/* connector */}
      {children.length > 0 && (
        <div className="w-full h-6 relative flex items-center justify-center">
          <SvgConnector isLeftWinner={isLeftChildWinner} isRightWinner={isRightChildWinner} />
        </div>
      )}

      {/* card */}
      <div
        className={`
          bg-white border-t-4 rounded-lg p-2 w-48 text-center cursor-pointer
          transition-all hover:scale-[1.02]
          ${statusColors}
        `}
        onClick={() => onMatchClick(officialMatch)}
      >
        <div className="flex justify-between items-center mb-1 pb-1 border-b border-dashed border-slate-100">
          <span className="text-[10px] font-bold text-slate-400">
            #{officialMatch.matchNumber}
          </span>
          <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
            {officialMatch.roundName || `Vòng ${officialMatch.round}`}
          </span>
        </div>

        <div className="flex flex-col gap-1 my-1">
          <div
            className={`text-sm font-semibold truncate ${
              officialMatch.winnerClassGroupId === officialMatch.classGroup1Id
                ? "text-emerald-600"
                : "text-slate-700"
            }`}
          >
            {officialMatch.classGroup1Name || `Lớp ${officialMatch.classGroup1Id || "?"}`}
          </div>
          <div className="text-xs font-bold text-slate-400">{scoreText}</div>
          <div
            className={`text-sm font-semibold truncate ${
              officialMatch.winnerClassGroupId === officialMatch.classGroup2Id
                ? "text-emerald-600"
                : "text-slate-700"
            }`}
          >
            {officialMatch.classGroup2Name || `Lớp ${officialMatch.classGroup2Id || "?"}`}
          </div>
        </div>

        {officialMatch.matchDate && (
          <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-center gap-1 text-[10px] text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(officialMatch.matchDate)}</span>
            <span>•</span>
            <span>{formatTime(officialMatch.startTime)}</span>
          </div>
        )}
        {officialMatch.location && (
          <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-slate-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[140px]">{officialMatch.location}</span>
          </div>
        )}
      </div>

      <div className="h-4" />
    </div>
  )
}

// Xây tree từ matches (dùng nextMatchId để liên kết)
const transformToTreeStructure = (matches) => {
  if (!matches || matches.length === 0) return null

  const nodeMap = new Map()
  matches.forEach((m) => {
    nodeMap.set(m.matchNumber, { match: m, children: [] })
  })

  matches.forEach((m) => {
    const parentNode = nodeMap.get(m.matchNumber)
    const childrenMatches = matches.filter(
      (child) => (child.nextMatchId || child.NextMatchId) === m.matchNumber
    )

    childrenMatches
      .sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0))
      .forEach((child) => {
        const childNode = nodeMap.get(child.matchNumber)
        if (childNode) parentNode.children.push(childNode)
      })
  })

  let root =
    [...nodeMap.values()].find((node) => {
      const nextId = node.match.nextMatchId || node.match.NextMatchId
      return !nextId
    }) || [...nodeMap.values()].pop()

  return root
}

export const BracketTree = memo(
  ({ matches, official, onMatchClick }) => {
    const treeData = useMemo(() => {
      if (!matches || matches.length === 0) return null
      const root = transformToTreeStructure(matches)
      if (!root) return null

      const officialMatchByNumber = {}
      if (official?.rounds?.length) {
        official.rounds.forEach((round) => {
          round.matches.forEach((m) => {
            officialMatchByNumber[m.matchNumber] = m
          })
        })
      }

      return { root, officialMatchByNumber }
    }, [matches, official])

    if (!treeData?.root) return null

    return (
      <div className="p-8 min-w-max flex justify-center">
        <MatchNode
          node={treeData.root}
          onMatchClick={onMatchClick}
          officialMatchByNumber={treeData.officialMatchByNumber}
        />
      </div>
    )
  },
  (prev, next) =>
    prev.matches === next.matches &&
    prev.official === next.official &&
    prev.onMatchClick === next.onMatchClick
)


