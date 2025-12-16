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

const MatchNode = ({ node, onMatchClick, officialMatchByNumber, getClassNameById }) => {
  if (!node) return null

  const { match: m, children = [] } = node
  const officialMatch = officialMatchByNumber?.[m.matchNumber] || m
  const status = officialMatch.status ?? 0
  const isBye = officialMatch.isBye || officialMatch.IsBye

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

  const displayTeam = (sideIndex) => {
    const name =
      sideIndex === 1 ? officialMatch.classGroup1Name : officialMatch.classGroup2Name
    const id = sideIndex === 1 ? officialMatch.classGroup1Id : officialMatch.classGroup2Id

    if (name) return name
    const resolved = getClassNameById ? getClassNameById(id) : null
    if (resolved) return resolved

    const child = children?.[sideIndex - 1]
    if (child?.match?.matchNumber != null) {
      const childMatch = child.match
      const winnerId = childMatch.winnerClassGroupId ?? childMatch.WinnerClassGroupId
      if (winnerId) {
        const winnerName = getClassNameById ? getClassNameById(winnerId) : null
        if (winnerName) return winnerName
      }
      return `Thắng trận #${child.match.matchNumber}`
    }

    return "Chờ kết quả"
  }

  const scoreText =
    officialMatch.score1 != null && officialMatch.score2 != null
      ? `${officialMatch.score1} - ${officialMatch.score2}`
      : isBye
      ? "BYE"
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
                getClassNameById={getClassNameById}
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

        {isBye && (
          <div className="mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded bg-amber-100 text-amber-700">
              BYE • Vượt vòng
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1 my-1">
          <div
            className={`text-sm font-semibold truncate ${
              officialMatch.winnerClassGroupId === officialMatch.classGroup1Id
                ? "text-emerald-600"
                : "text-slate-700"
            }`}
          >
            {displayTeam(1)}
          </div>
          <div className="text-xs font-bold text-slate-400">{scoreText}</div>
          <div
            className={`text-sm font-semibold truncate ${
              officialMatch.winnerClassGroupId === officialMatch.classGroup2Id
                ? "text-emerald-600"
                : "text-slate-700"
            }`}
          >
            {displayTeam(2)}
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

// Chuẩn hóa liên kết trận: hỗ trợ nextMatchNumber hoặc nextMatchId (id DB)
const normalizeLinkage = (matches) => {
  if (!Array.isArray(matches)) return []
  const idByMatchNumber = new Map()
  matches.forEach((m) => {
    const num = m.matchNumber ?? m.MatchNumber
    const id = m.id ?? m.Id
    if (num != null) idByMatchNumber.set(num, id)
  })

  return matches.map((m) => {
    const clone = { ...m }
    const matchNumber = m.matchNumber ?? m.MatchNumber
    const nextNumber = m.nextMatchNumber ?? m.NextMatchNumber
    const nextId = m.nextMatchId ?? m.NextMatchId

    // Ưu tiên nextMatchNumber nếu có; nếu chỉ có id, thử map ngược sang matchNumber
    if (nextNumber != null) {
      clone._linkTo = nextNumber
    } else if (nextId != null) {
      // Tìm matchNumber tương ứng với id DB của trận kế tiếp
      const target = matches.find((x) => (x.id ?? x.Id) === nextId)
      if (target) {
        clone._linkTo = target.matchNumber ?? target.MatchNumber ?? nextId
      } else {
        clone._linkTo = nextId
      }
    } else {
      clone._linkTo = null
    }

    clone._id = m.id ?? m.Id ?? matchNumber
    clone._matchNumber = matchNumber
    return clone
  })
}

// Xây tree từ matches (dùng _linkTo hoặc nextMatchNumber/nextMatchId)
const transformToTreeStructure = (rawMatches) => {
  if (!rawMatches || rawMatches.length === 0) return null

  const matches = normalizeLinkage(rawMatches)

  const nodeMap = new Map()
  matches.forEach((m) => {
    nodeMap.set(m._matchNumber, { match: m, children: [] })
  })

  matches.forEach((m) => {
    const parentNode = nodeMap.get(m._matchNumber)
    const childrenMatches = matches.filter((child) => child._linkTo === m._matchNumber)

    childrenMatches
      .sort((a, b) => (a._matchNumber || 0) - (b._matchNumber || 0))
      .forEach((child) => {
        const childNode = nodeMap.get(child._matchNumber)
        if (childNode) parentNode.children.push(childNode)
      })
  })

  // Root: trận không có link lên trên; fallback lấy round lớn nhất
  let root =
    [...nodeMap.values()].find((node) => {
      const parentLink = node.match._linkTo
      return !parentLink
    }) || [...nodeMap.values()].reduce((max, curr) =>
      (curr.match.round || 0) > (max.match.round || 0) ? curr : max
    )

  return root
}

export const BracketTree = memo(
  ({ matches, official, onMatchClick, getClassNameById }) => {
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
          getClassNameById={getClassNameById}
        />
      </div>
    )
  },
  (prev, next) =>
    prev.matches === next.matches &&
    prev.official === next.official &&
    prev.onMatchClick === next.onMatchClick &&
    prev.getClassNameById === next.getClassNameById
)


