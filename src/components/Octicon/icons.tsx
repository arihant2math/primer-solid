import { splitProps, type Component, type JSX } from 'solid-js'
import { mergeClassNames, mergeStyles } from '../../utils'
import { assignRef, type RefProp } from '../../utils/solid'
import { octicons } from './octicons'
import type { OcticonName } from './octicons'

export type IconSize = 'small' | 'medium' | 'large'

export type IconProps = Omit<
  JSX.SvgSVGAttributes<SVGSVGElement>,
  'ref' | 'className' | 'title'
> & {
  class?: string
  className?: string
  fill?: string
  ref?: RefProp<SVGSVGElement>
  size?: number | IconSize
  title?: JSX.Element | string
  verticalAlign?: 'middle' | 'text-bottom' | 'text-top' | 'top' | 'unset'
}

export type Icon = Component<IconProps>

const sizeMap = {
  small: 16,
  medium: 32,
  large: 64,
} as const

function closestNaturalHeight(naturalHeights: string[], height: number) {
  return naturalHeights
    .map((naturalHeight) => Number.parseInt(naturalHeight, 10))
    .reduce(
      (currentHeight, naturalHeight) =>
        naturalHeight <= height ? naturalHeight : currentHeight,
      Number.parseInt(naturalHeights[0] ?? '16', 10),
    )
}

function createIconComponent(
  displayName: string,
  octiconName: OcticonName,
): Icon {
  const svgDataByHeight = octicons[octiconName].heights
  const heights = Object.keys(svgDataByHeight)

  const IconComponent: Component<IconProps> = (props) => {
    const [local, rest] = splitProps(props, [
      'aria-label',
      'aria-labelledby',
      'class',
      'className',
      'fill',
      'ref',
      'size',
      'style',
      'tabIndex',
      'title',
      'verticalAlign',
    ])

    const height = () => {
      if (typeof local.size === 'string') return sizeMap[local.size]
      return local.size ?? 16
    }
    const naturalHeight = () => closestNaturalHeight(heights, height())
    const svgData = () =>
      svgDataByHeight[String(naturalHeight())] ??
      svgDataByHeight[heights[0] ?? '16']
    const labelled = () =>
      Boolean(local['aria-label'] || local['aria-labelledby'])
    const tabIndex = () => {
      if (typeof local.tabIndex === 'number') return local.tabIndex
      if (local.tabIndex == null) return undefined
      const parsed = Number(local.tabIndex)
      return Number.isFinite(parsed) ? parsed : undefined
    }

    const focusable = () => {
      const resolvedTabIndex = tabIndex()
      return resolvedTabIndex != null && resolvedTabIndex >= 0
        ? 'true'
        : 'false'
    }

    return (
      <svg
        {...rest}
        {...({
          focusable: focusable(),
        } as unknown as JSX.SvgSVGAttributes<SVGSVGElement>)}
        ref={(element) => assignRef(local.ref, element)}
        data-component="Octicon"
        aria-hidden={labelled() ? undefined : 'true'}
        tabIndex={local.tabIndex}
        aria-label={local['aria-label']}
        aria-labelledby={local['aria-labelledby']}
        class={mergeClassNames(
          `octicon octicon-${octiconName}`,
          local.className,
          local.class,
        )}
        role={labelled() ? 'img' : undefined}
        viewBox={`0 0 ${svgData().width} ${naturalHeight()}`}
        width={height() * (svgData().width / naturalHeight())}
        height={height()}
        fill={local.fill ?? 'currentColor'}
        display="inline-block"
        overflow="visible"
        style={mergeStyles(
          { 'vertical-align': local.verticalAlign ?? 'text-bottom' },
          local.style,
        )}
      >
        {local.title ? <title>{local.title}</title> : null}
        <g innerHTML={svgData().path} />
      </svg>
    )
  }

  ;(IconComponent as { displayName?: string }).displayName = displayName

  return IconComponent
}

export const AccessibilityIcon = createIconComponent(
  'AccessibilityIcon',
  'accessibility',
)
export const AccessibilityInsetIcon = createIconComponent(
  'AccessibilityInsetIcon',
  'accessibility-inset',
)
export const AgentIcon = createIconComponent('AgentIcon', 'agent')
export const AiModelIcon = createIconComponent('AiModelIcon', 'ai-model')
export const AlertIcon = createIconComponent('AlertIcon', 'alert')
export const AlertFillIcon = createIconComponent('AlertFillIcon', 'alert-fill')
export const AppsIcon = createIconComponent('AppsIcon', 'apps')
export const ArchiveIcon = createIconComponent('ArchiveIcon', 'archive')
export const ArrowBothIcon = createIconComponent('ArrowBothIcon', 'arrow-both')
export const ArrowDownIcon = createIconComponent('ArrowDownIcon', 'arrow-down')
export const ArrowDownLeftIcon = createIconComponent(
  'ArrowDownLeftIcon',
  'arrow-down-left',
)
export const ArrowDownRightIcon = createIconComponent(
  'ArrowDownRightIcon',
  'arrow-down-right',
)
export const ArrowLeftIcon = createIconComponent('ArrowLeftIcon', 'arrow-left')
export const ArrowRightIcon = createIconComponent(
  'ArrowRightIcon',
  'arrow-right',
)
export const ArrowSwitchIcon = createIconComponent(
  'ArrowSwitchIcon',
  'arrow-switch',
)
export const ArrowUpIcon = createIconComponent('ArrowUpIcon', 'arrow-up')
export const ArrowUpLeftIcon = createIconComponent(
  'ArrowUpLeftIcon',
  'arrow-up-left',
)
export const ArrowUpRightIcon = createIconComponent(
  'ArrowUpRightIcon',
  'arrow-up-right',
)
export const BeakerIcon = createIconComponent('BeakerIcon', 'beaker')
export const BellIcon = createIconComponent('BellIcon', 'bell')
export const BellFillIcon = createIconComponent('BellFillIcon', 'bell-fill')
export const BellSlashIcon = createIconComponent('BellSlashIcon', 'bell-slash')
export const BlockedIcon = createIconComponent('BlockedIcon', 'blocked')
export const BoldIcon = createIconComponent('BoldIcon', 'bold')
export const BookIcon = createIconComponent('BookIcon', 'book')
export const BookLockedIcon = createIconComponent(
  'BookLockedIcon',
  'book-locked',
)
export const BookmarkIcon = createIconComponent('BookmarkIcon', 'bookmark')
export const BookmarkFillIcon = createIconComponent(
  'BookmarkFillIcon',
  'bookmark-fill',
)
export const BookmarkFilledIcon = createIconComponent(
  'BookmarkFilledIcon',
  'bookmark-filled',
)
export const BookmarkSlashIcon = createIconComponent(
  'BookmarkSlashIcon',
  'bookmark-slash',
)
export const BookmarkSlashFillIcon = createIconComponent(
  'BookmarkSlashFillIcon',
  'bookmark-slash-fill',
)
export const BooleanOffIcon = createIconComponent(
  'BooleanOffIcon',
  'boolean-off',
)
export const BooleanOnIcon = createIconComponent('BooleanOnIcon', 'boolean-on')
export const BriefcaseIcon = createIconComponent('BriefcaseIcon', 'briefcase')
export const BroadcastIcon = createIconComponent('BroadcastIcon', 'broadcast')
export const BrowserIcon = createIconComponent('BrowserIcon', 'browser')
export const BugIcon = createIconComponent('BugIcon', 'bug')
export const CacheIcon = createIconComponent('CacheIcon', 'cache')
export const CalendarIcon = createIconComponent('CalendarIcon', 'calendar')
export const CheckIcon = createIconComponent('CheckIcon', 'check')
export const CheckCircleIcon = createIconComponent(
  'CheckCircleIcon',
  'check-circle',
)
export const CheckCircleFillIcon = createIconComponent(
  'CheckCircleFillIcon',
  'check-circle-fill',
)
export const CheckboxIcon = createIconComponent('CheckboxIcon', 'checkbox')
export const CheckboxFillIcon = createIconComponent(
  'CheckboxFillIcon',
  'checkbox-fill',
)
export const ChecklistIcon = createIconComponent('ChecklistIcon', 'checklist')
export const ChevronDownIcon = createIconComponent(
  'ChevronDownIcon',
  'chevron-down',
)
export const ChevronLeftIcon = createIconComponent(
  'ChevronLeftIcon',
  'chevron-left',
)
export const ChevronRightIcon = createIconComponent(
  'ChevronRightIcon',
  'chevron-right',
)
export const ChevronUpIcon = createIconComponent('ChevronUpIcon', 'chevron-up')
export const CircleIcon = createIconComponent('CircleIcon', 'circle')
export const CircleSlashIcon = createIconComponent(
  'CircleSlashIcon',
  'circle-slash',
)
export const ClockIcon = createIconComponent('ClockIcon', 'clock')
export const ClockFillIcon = createIconComponent('ClockFillIcon', 'clock-fill')
export const CloudIcon = createIconComponent('CloudIcon', 'cloud')
export const CloudOfflineIcon = createIconComponent(
  'CloudOfflineIcon',
  'cloud-offline',
)
export const CodeIcon = createIconComponent('CodeIcon', 'code')
export const CodeOfConductIcon = createIconComponent(
  'CodeOfConductIcon',
  'code-of-conduct',
)
export const CodeReviewIcon = createIconComponent(
  'CodeReviewIcon',
  'code-review',
)
export const CodeSquareIcon = createIconComponent(
  'CodeSquareIcon',
  'code-square',
)
export const CodescanIcon = createIconComponent('CodescanIcon', 'codescan')
export const CodescanCheckmarkIcon = createIconComponent(
  'CodescanCheckmarkIcon',
  'codescan-checkmark',
)
export const CodespacesIcon = createIconComponent(
  'CodespacesIcon',
  'codespaces',
)
export const ColumnsIcon = createIconComponent('ColumnsIcon', 'columns')
export const CommandPaletteIcon = createIconComponent(
  'CommandPaletteIcon',
  'command-palette',
)
export const CommentIcon = createIconComponent('CommentIcon', 'comment')
export const CommentAiIcon = createIconComponent('CommentAiIcon', 'comment-ai')
export const CommentDiscussionIcon = createIconComponent(
  'CommentDiscussionIcon',
  'comment-discussion',
)
export const CommentLockedIcon = createIconComponent(
  'CommentLockedIcon',
  'comment-locked',
)
export const ComposeIcon = createIconComponent('ComposeIcon', 'compose')
export const ContainerIcon = createIconComponent('ContainerIcon', 'container')
export const CopilotIcon = createIconComponent('CopilotIcon', 'copilot')
export const CopilotErrorIcon = createIconComponent(
  'CopilotErrorIcon',
  'copilot-error',
)
export const CopilotWarningIcon = createIconComponent(
  'CopilotWarningIcon',
  'copilot-warning',
)
export const CopyIcon = createIconComponent('CopyIcon', 'copy')
export const CpuIcon = createIconComponent('CpuIcon', 'cpu')
export const CreditCardIcon = createIconComponent(
  'CreditCardIcon',
  'credit-card',
)
export const CrossReferenceIcon = createIconComponent(
  'CrossReferenceIcon',
  'cross-reference',
)
export const CrosshairsIcon = createIconComponent(
  'CrosshairsIcon',
  'crosshairs',
)
export const DashIcon = createIconComponent('DashIcon', 'dash')
export const DatabaseIcon = createIconComponent('DatabaseIcon', 'database')
export const DependabotIcon = createIconComponent(
  'DependabotIcon',
  'dependabot',
)
export const DesktopDownloadIcon = createIconComponent(
  'DesktopDownloadIcon',
  'desktop-download',
)
export const DeviceCameraIcon = createIconComponent(
  'DeviceCameraIcon',
  'device-camera',
)
export const DeviceCameraVideoIcon = createIconComponent(
  'DeviceCameraVideoIcon',
  'device-camera-video',
)
export const DeviceDesktopIcon = createIconComponent(
  'DeviceDesktopIcon',
  'device-desktop',
)
export const DeviceMobileIcon = createIconComponent(
  'DeviceMobileIcon',
  'device-mobile',
)
export const DevicesIcon = createIconComponent('DevicesIcon', 'devices')
export const DiamondIcon = createIconComponent('DiamondIcon', 'diamond')
export const DiceIcon = createIconComponent('DiceIcon', 'dice')
export const DiffIcon = createIconComponent('DiffIcon', 'diff')
export const DiffAddedIcon = createIconComponent('DiffAddedIcon', 'diff-added')
export const DiffIgnoredIcon = createIconComponent(
  'DiffIgnoredIcon',
  'diff-ignored',
)
export const DiffModifiedIcon = createIconComponent(
  'DiffModifiedIcon',
  'diff-modified',
)
export const DiffRemovedIcon = createIconComponent(
  'DiffRemovedIcon',
  'diff-removed',
)
export const DiffRenamedIcon = createIconComponent(
  'DiffRenamedIcon',
  'diff-renamed',
)
export const DiscussionClosedIcon = createIconComponent(
  'DiscussionClosedIcon',
  'discussion-closed',
)
export const DiscussionDuplicateIcon = createIconComponent(
  'DiscussionDuplicateIcon',
  'discussion-duplicate',
)
export const DiscussionOutdatedIcon = createIconComponent(
  'DiscussionOutdatedIcon',
  'discussion-outdated',
)
export const DotIcon = createIconComponent('DotIcon', 'dot')
export const DotFillIcon = createIconComponent('DotFillIcon', 'dot-fill')
export const DownloadIcon = createIconComponent('DownloadIcon', 'download')
export const DuplicateIcon = createIconComponent('DuplicateIcon', 'duplicate')
export const EllipsisIcon = createIconComponent('EllipsisIcon', 'ellipsis')
export const ExclamationIcon = createIconComponent(
  'ExclamationIcon',
  'exclamation',
)
export const EyeIcon = createIconComponent('EyeIcon', 'eye')
export const EyeClosedIcon = createIconComponent('EyeClosedIcon', 'eye-closed')
export const FeedDiscussionIcon = createIconComponent(
  'FeedDiscussionIcon',
  'feed-discussion',
)
export const FeedForkedIcon = createIconComponent(
  'FeedForkedIcon',
  'feed-forked',
)
export const FeedHeartIcon = createIconComponent('FeedHeartIcon', 'feed-heart')
export const FeedIssueClosedIcon = createIconComponent(
  'FeedIssueClosedIcon',
  'feed-issue-closed',
)
export const FeedIssueDraftIcon = createIconComponent(
  'FeedIssueDraftIcon',
  'feed-issue-draft',
)
export const FeedIssueOpenIcon = createIconComponent(
  'FeedIssueOpenIcon',
  'feed-issue-open',
)
export const FeedIssueReopenIcon = createIconComponent(
  'FeedIssueReopenIcon',
  'feed-issue-reopen',
)
export const FeedMergedIcon = createIconComponent(
  'FeedMergedIcon',
  'feed-merged',
)
export const FeedPersonIcon = createIconComponent(
  'FeedPersonIcon',
  'feed-person',
)
export const FeedPlusIcon = createIconComponent('FeedPlusIcon', 'feed-plus')
export const FeedPublicIcon = createIconComponent(
  'FeedPublicIcon',
  'feed-public',
)
export const FeedPullRequestClosedIcon = createIconComponent(
  'FeedPullRequestClosedIcon',
  'feed-pull-request-closed',
)
export const FeedPullRequestDraftIcon = createIconComponent(
  'FeedPullRequestDraftIcon',
  'feed-pull-request-draft',
)
export const FeedPullRequestOpenIcon = createIconComponent(
  'FeedPullRequestOpenIcon',
  'feed-pull-request-open',
)
export const FeedRepoIcon = createIconComponent('FeedRepoIcon', 'feed-repo')
export const FeedRocketIcon = createIconComponent(
  'FeedRocketIcon',
  'feed-rocket',
)
export const FeedStarIcon = createIconComponent('FeedStarIcon', 'feed-star')
export const FeedTagIcon = createIconComponent('FeedTagIcon', 'feed-tag')
export const FeedTrophyIcon = createIconComponent(
  'FeedTrophyIcon',
  'feed-trophy',
)
export const FileIcon = createIconComponent('FileIcon', 'file')
export const FileAddedIcon = createIconComponent('FileAddedIcon', 'file-added')
export const FileBadgeIcon = createIconComponent('FileBadgeIcon', 'file-badge')
export const FileBinaryIcon = createIconComponent(
  'FileBinaryIcon',
  'file-binary',
)
export const FileCheckIcon = createIconComponent('FileCheckIcon', 'file-check')
export const FileCodeIcon = createIconComponent('FileCodeIcon', 'file-code')
export const FileDiffIcon = createIconComponent('FileDiffIcon', 'file-diff')
export const FileDirectoryIcon = createIconComponent(
  'FileDirectoryIcon',
  'file-directory',
)
export const FileDirectoryFillIcon = createIconComponent(
  'FileDirectoryFillIcon',
  'file-directory-fill',
)
export const FileDirectoryOpenFillIcon = createIconComponent(
  'FileDirectoryOpenFillIcon',
  'file-directory-open-fill',
)
export const FileDirectorySymlinkIcon = createIconComponent(
  'FileDirectorySymlinkIcon',
  'file-directory-symlink',
)
export const FileMediaIcon = createIconComponent('FileMediaIcon', 'file-media')
export const FileMovedIcon = createIconComponent('FileMovedIcon', 'file-moved')
export const FileRemovedIcon = createIconComponent(
  'FileRemovedIcon',
  'file-removed',
)
export const FileSubmoduleIcon = createIconComponent(
  'FileSubmoduleIcon',
  'file-submodule',
)
export const FileSymlinkFileIcon = createIconComponent(
  'FileSymlinkFileIcon',
  'file-symlink-file',
)
export const FileZipIcon = createIconComponent('FileZipIcon', 'file-zip')
export const FilterIcon = createIconComponent('FilterIcon', 'filter')
export const FilterRemoveIcon = createIconComponent(
  'FilterRemoveIcon',
  'filter-remove',
)
export const FiscalHostIcon = createIconComponent(
  'FiscalHostIcon',
  'fiscal-host',
)
export const FlameIcon = createIconComponent('FlameIcon', 'flame')
export const FlowchartIcon = createIconComponent('FlowchartIcon', 'flowchart')
export const FocusCenterIcon = createIconComponent(
  'FocusCenterIcon',
  'focus-center',
)
export const FoldIcon = createIconComponent('FoldIcon', 'fold')
export const FoldDownIcon = createIconComponent('FoldDownIcon', 'fold-down')
export const FoldUpIcon = createIconComponent('FoldUpIcon', 'fold-up')
export const GearIcon = createIconComponent('GearIcon', 'gear')
export const GiftIcon = createIconComponent('GiftIcon', 'gift')
export const GitBranchIcon = createIconComponent('GitBranchIcon', 'git-branch')
export const GitBranchCheckIcon = createIconComponent(
  'GitBranchCheckIcon',
  'git-branch-check',
)
export const GitCommitIcon = createIconComponent('GitCommitIcon', 'git-commit')
export const GitCompareIcon = createIconComponent(
  'GitCompareIcon',
  'git-compare',
)
export const GitMergeIcon = createIconComponent('GitMergeIcon', 'git-merge')
export const GitMergeQueueIcon = createIconComponent(
  'GitMergeQueueIcon',
  'git-merge-queue',
)
export const GitPullRequestIcon = createIconComponent(
  'GitPullRequestIcon',
  'git-pull-request',
)
export const GitPullRequestClosedIcon = createIconComponent(
  'GitPullRequestClosedIcon',
  'git-pull-request-closed',
)
export const GitPullRequestDraftIcon = createIconComponent(
  'GitPullRequestDraftIcon',
  'git-pull-request-draft',
)
export const GitPullRequestLockedIcon = createIconComponent(
  'GitPullRequestLockedIcon',
  'git-pull-request-locked',
)
export const GlobeIcon = createIconComponent('GlobeIcon', 'globe')
export const GoalIcon = createIconComponent('GoalIcon', 'goal')
export const GrabberIcon = createIconComponent('GrabberIcon', 'grabber')
export const GraphIcon = createIconComponent('GraphIcon', 'graph')
export const GraphBarHorizontalIcon = createIconComponent(
  'GraphBarHorizontalIcon',
  'graph-bar-horizontal',
)
export const GraphBarVerticalIcon = createIconComponent(
  'GraphBarVerticalIcon',
  'graph-bar-vertical',
)
export const HashIcon = createIconComponent('HashIcon', 'hash')
export const HeadingIcon = createIconComponent('HeadingIcon', 'heading')
export const HeartIcon = createIconComponent('HeartIcon', 'heart')
export const HeartFillIcon = createIconComponent('HeartFillIcon', 'heart-fill')
export const HistoryIcon = createIconComponent('HistoryIcon', 'history')
export const HomeIcon = createIconComponent('HomeIcon', 'home')
export const HomeFillIcon = createIconComponent('HomeFillIcon', 'home-fill')
export const HorizontalRuleIcon = createIconComponent(
  'HorizontalRuleIcon',
  'horizontal-rule',
)
export const HourglassIcon = createIconComponent('HourglassIcon', 'hourglass')
export const HubotIcon = createIconComponent('HubotIcon', 'hubot')
export const IdBadgeIcon = createIconComponent('IdBadgeIcon', 'id-badge')
export const ImageIcon = createIconComponent('ImageIcon', 'image')
export const InboxIcon = createIconComponent('InboxIcon', 'inbox')
export const InboxFillIcon = createIconComponent('InboxFillIcon', 'inbox-fill')
export const InfinityIcon = createIconComponent('InfinityIcon', 'infinity')
export const InfoIcon = createIconComponent('InfoIcon', 'info')
export const IssueClosedIcon = createIconComponent(
  'IssueClosedIcon',
  'issue-closed',
)
export const IssueDraftIcon = createIconComponent(
  'IssueDraftIcon',
  'issue-draft',
)
export const IssueLockedIcon = createIconComponent(
  'IssueLockedIcon',
  'issue-locked',
)
export const IssueOpenedIcon = createIconComponent(
  'IssueOpenedIcon',
  'issue-opened',
)
export const IssueReopenedIcon = createIconComponent(
  'IssueReopenedIcon',
  'issue-reopened',
)
export const IssueTrackedByIcon = createIconComponent(
  'IssueTrackedByIcon',
  'issue-tracked-by',
)
export const IssueTracksIcon = createIconComponent(
  'IssueTracksIcon',
  'issue-tracks',
)
export const ItalicIcon = createIconComponent('ItalicIcon', 'italic')
export const IterationsIcon = createIconComponent(
  'IterationsIcon',
  'iterations',
)
export const KebabHorizontalIcon = createIconComponent(
  'KebabHorizontalIcon',
  'kebab-horizontal',
)
export const KeyIcon = createIconComponent('KeyIcon', 'key')
export const KeyAsteriskIcon = createIconComponent(
  'KeyAsteriskIcon',
  'key-asterisk',
)
export const LawIcon = createIconComponent('LawIcon', 'law')
export const LightBulbIcon = createIconComponent('LightBulbIcon', 'light-bulb')
export const LinkIcon = createIconComponent('LinkIcon', 'link')
export const LinkExternalIcon = createIconComponent(
  'LinkExternalIcon',
  'link-external',
)
export const ListOrderedIcon = createIconComponent(
  'ListOrderedIcon',
  'list-ordered',
)
export const ListUnorderedIcon = createIconComponent(
  'ListUnorderedIcon',
  'list-unordered',
)
export const LocationIcon = createIconComponent('LocationIcon', 'location')
export const LockIcon = createIconComponent('LockIcon', 'lock')
export const LockupGithubIcon = createIconComponent(
  'LockupGithubIcon',
  'lockup-github',
)
export const LogIcon = createIconComponent('LogIcon', 'log')
export const LogoGistIcon = createIconComponent('LogoGistIcon', 'logo-gist')
export const LogoGithubIcon = createIconComponent(
  'LogoGithubIcon',
  'logo-github',
)
export const LoopIcon = createIconComponent('LoopIcon', 'loop')
export const MailIcon = createIconComponent('MailIcon', 'mail')
export const MarkGithubIcon = createIconComponent(
  'MarkGithubIcon',
  'mark-github',
)
export const MarkdownIcon = createIconComponent('MarkdownIcon', 'markdown')
export const MaximizeIcon = createIconComponent('MaximizeIcon', 'maximize')
export const McpIcon = createIconComponent('McpIcon', 'mcp')
export const MegaphoneIcon = createIconComponent('MegaphoneIcon', 'megaphone')
export const MentionIcon = createIconComponent('MentionIcon', 'mention')
export const MeterIcon = createIconComponent('MeterIcon', 'meter')
export const MilestoneIcon = createIconComponent('MilestoneIcon', 'milestone')
export const MinimizeIcon = createIconComponent('MinimizeIcon', 'minimize')
export const MirrorIcon = createIconComponent('MirrorIcon', 'mirror')
export const MoonIcon = createIconComponent('MoonIcon', 'moon')
export const MortarBoardIcon = createIconComponent(
  'MortarBoardIcon',
  'mortar-board',
)
export const MoveToBottomIcon = createIconComponent(
  'MoveToBottomIcon',
  'move-to-bottom',
)
export const MoveToEndIcon = createIconComponent('MoveToEndIcon', 'move-to-end')
export const MoveToStartIcon = createIconComponent(
  'MoveToStartIcon',
  'move-to-start',
)
export const MoveToTopIcon = createIconComponent('MoveToTopIcon', 'move-to-top')
export const MultiSelectIcon = createIconComponent(
  'MultiSelectIcon',
  'multi-select',
)
export const MuteIcon = createIconComponent('MuteIcon', 'mute')
export const NoEntryIcon = createIconComponent('NoEntryIcon', 'no-entry')
export const NoEntryFillIcon = createIconComponent(
  'NoEntryFillIcon',
  'no-entry-fill',
)
export const NodeIcon = createIconComponent('NodeIcon', 'node')
export const NorthStarIcon = createIconComponent('NorthStarIcon', 'north-star')
export const NoteIcon = createIconComponent('NoteIcon', 'note')
export const NumberIcon = createIconComponent('NumberIcon', 'number')
export const OrganizationIcon = createIconComponent(
  'OrganizationIcon',
  'organization',
)
export const PackageIcon = createIconComponent('PackageIcon', 'package')
export const PackageDependenciesIcon = createIconComponent(
  'PackageDependenciesIcon',
  'package-dependencies',
)
export const PackageDependentsIcon = createIconComponent(
  'PackageDependentsIcon',
  'package-dependents',
)
export const PaintbrushIcon = createIconComponent(
  'PaintbrushIcon',
  'paintbrush',
)
export const PaperAirplaneIcon = createIconComponent(
  'PaperAirplaneIcon',
  'paper-airplane',
)
export const PaperclipIcon = createIconComponent('PaperclipIcon', 'paperclip')
export const PasskeyFillIcon = createIconComponent(
  'PasskeyFillIcon',
  'passkey-fill',
)
export const PasteIcon = createIconComponent('PasteIcon', 'paste')
export const PauseIcon = createIconComponent('PauseIcon', 'pause')
export const PencilIcon = createIconComponent('PencilIcon', 'pencil')
export const PencilAiIcon = createIconComponent('PencilAiIcon', 'pencil-ai')
export const PeopleIcon = createIconComponent('PeopleIcon', 'people')
export const PersonIcon = createIconComponent('PersonIcon', 'person')
export const PersonAddIcon = createIconComponent('PersonAddIcon', 'person-add')
export const PersonFillIcon = createIconComponent(
  'PersonFillIcon',
  'person-fill',
)
export const PinIcon = createIconComponent('PinIcon', 'pin')
export const PinSlashIcon = createIconComponent('PinSlashIcon', 'pin-slash')
export const PivotColumnIcon = createIconComponent(
  'PivotColumnIcon',
  'pivot-column',
)
export const PlayIcon = createIconComponent('PlayIcon', 'play')
export const PlugIcon = createIconComponent('PlugIcon', 'plug')
export const PlusIcon = createIconComponent('PlusIcon', 'plus')
export const PlusCircleIcon = createIconComponent(
  'PlusCircleIcon',
  'plus-circle',
)
export const ProjectIcon = createIconComponent('ProjectIcon', 'project')
export const ProjectRoadmapIcon = createIconComponent(
  'ProjectRoadmapIcon',
  'project-roadmap',
)
export const ProjectSymlinkIcon = createIconComponent(
  'ProjectSymlinkIcon',
  'project-symlink',
)
export const ProjectTemplateIcon = createIconComponent(
  'ProjectTemplateIcon',
  'project-template',
)
export const PulseIcon = createIconComponent('PulseIcon', 'pulse')
export const QuestionIcon = createIconComponent('QuestionIcon', 'question')
export const QuoteIcon = createIconComponent('QuoteIcon', 'quote')
export const ReadIcon = createIconComponent('ReadIcon', 'read')
export const RedoIcon = createIconComponent('RedoIcon', 'redo')
export const RelFilePathIcon = createIconComponent(
  'RelFilePathIcon',
  'rel-file-path',
)
export const ReplyIcon = createIconComponent('ReplyIcon', 'reply')
export const RepoIcon = createIconComponent('RepoIcon', 'repo')
export const RepoCloneIcon = createIconComponent('RepoCloneIcon', 'repo-clone')
export const RepoDeleteIcon = createIconComponent(
  'RepoDeleteIcon',
  'repo-delete',
)
export const RepoDeletedIcon = createIconComponent(
  'RepoDeletedIcon',
  'repo-deleted',
)
export const RepoForkedIcon = createIconComponent(
  'RepoForkedIcon',
  'repo-forked',
)
export const RepoLockedIcon = createIconComponent(
  'RepoLockedIcon',
  'repo-locked',
)
export const RepoPullIcon = createIconComponent('RepoPullIcon', 'repo-pull')
export const RepoPushIcon = createIconComponent('RepoPushIcon', 'repo-push')
export const RepoTemplateIcon = createIconComponent(
  'RepoTemplateIcon',
  'repo-template',
)
export const ReportIcon = createIconComponent('ReportIcon', 'report')
export const RocketIcon = createIconComponent('RocketIcon', 'rocket')
export const RowsIcon = createIconComponent('RowsIcon', 'rows')
export const RssIcon = createIconComponent('RssIcon', 'rss')
export const RubyIcon = createIconComponent('RubyIcon', 'ruby')
export const SandboxIcon = createIconComponent('SandboxIcon', 'sandbox')
export const ScreenFullIcon = createIconComponent(
  'ScreenFullIcon',
  'screen-full',
)
export const ScreenNormalIcon = createIconComponent(
  'ScreenNormalIcon',
  'screen-normal',
)
export const SearchIcon = createIconComponent('SearchIcon', 'search')
export const ServerIcon = createIconComponent('ServerIcon', 'server')
export const ShareIcon = createIconComponent('ShareIcon', 'share')
export const ShareAndroidIcon = createIconComponent(
  'ShareAndroidIcon',
  'share-android',
)
export const ShieldIcon = createIconComponent('ShieldIcon', 'shield')
export const ShieldCheckIcon = createIconComponent(
  'ShieldCheckIcon',
  'shield-check',
)
export const ShieldLockIcon = createIconComponent(
  'ShieldLockIcon',
  'shield-lock',
)
export const ShieldSlashIcon = createIconComponent(
  'ShieldSlashIcon',
  'shield-slash',
)
export const ShieldXIcon = createIconComponent('ShieldXIcon', 'shield-x')
export const SidebarCollapseIcon = createIconComponent(
  'SidebarCollapseIcon',
  'sidebar-collapse',
)
export const SidebarExpandIcon = createIconComponent(
  'SidebarExpandIcon',
  'sidebar-expand',
)
export const SignInIcon = createIconComponent('SignInIcon', 'sign-in')
export const SignOutIcon = createIconComponent('SignOutIcon', 'sign-out')
export const SingleSelectIcon = createIconComponent(
  'SingleSelectIcon',
  'single-select',
)
export const SkipIcon = createIconComponent('SkipIcon', 'skip')
export const SkipFillIcon = createIconComponent('SkipFillIcon', 'skip-fill')
export const SlidersIcon = createIconComponent('SlidersIcon', 'sliders')
export const SmileyIcon = createIconComponent('SmileyIcon', 'smiley')
export const SmileyFrownIcon = createIconComponent(
  'SmileyFrownIcon',
  'smiley-frown',
)
export const SmileyFrustratedIcon = createIconComponent(
  'SmileyFrustratedIcon',
  'smiley-frustrated',
)
export const SmileyGrinIcon = createIconComponent(
  'SmileyGrinIcon',
  'smiley-grin',
)
export const SmileyNeutralIcon = createIconComponent(
  'SmileyNeutralIcon',
  'smiley-neutral',
)
export const SortAscIcon = createIconComponent('SortAscIcon', 'sort-asc')
export const SortDescIcon = createIconComponent('SortDescIcon', 'sort-desc')
export const SpaceIcon = createIconComponent('SpaceIcon', 'space')
export const SpacingLargeIcon = createIconComponent(
  'SpacingLargeIcon',
  'spacing-large',
)
export const SpacingMediumIcon = createIconComponent(
  'SpacingMediumIcon',
  'spacing-medium',
)
export const SpacingSmallIcon = createIconComponent(
  'SpacingSmallIcon',
  'spacing-small',
)
export const SparkleIcon = createIconComponent('SparkleIcon', 'sparkle')
export const SparkleFillIcon = createIconComponent(
  'SparkleFillIcon',
  'sparkle-fill',
)
export const SparklesFillIcon = createIconComponent(
  'SparklesFillIcon',
  'sparkles-fill',
)
export const SplitViewIcon = createIconComponent('SplitViewIcon', 'split-view')
export const SponsorTiersIcon = createIconComponent(
  'SponsorTiersIcon',
  'sponsor-tiers',
)
export const SquareIcon = createIconComponent('SquareIcon', 'square')
export const SquareCircleIcon = createIconComponent(
  'SquareCircleIcon',
  'square-circle',
)
export const SquareFillIcon = createIconComponent(
  'SquareFillIcon',
  'square-fill',
)
export const SquirrelIcon = createIconComponent('SquirrelIcon', 'squirrel')
export const StackIcon = createIconComponent('StackIcon', 'stack')
export const StackCheckIcon = createIconComponent(
  'StackCheckIcon',
  'stack-check',
)
export const StackRemoveIcon = createIconComponent(
  'StackRemoveIcon',
  'stack-remove',
)
export const StarIcon = createIconComponent('StarIcon', 'star')
export const StarFillIcon = createIconComponent('StarFillIcon', 'star-fill')
export const StopIcon = createIconComponent('StopIcon', 'stop')
export const StopwatchIcon = createIconComponent('StopwatchIcon', 'stopwatch')
export const StrikethroughIcon = createIconComponent(
  'StrikethroughIcon',
  'strikethrough',
)
export const SunIcon = createIconComponent('SunIcon', 'sun')
export const SyncIcon = createIconComponent('SyncIcon', 'sync')
export const TabIcon = createIconComponent('TabIcon', 'tab')
export const TabExternalIcon = createIconComponent(
  'TabExternalIcon',
  'tab-external',
)
export const TableIcon = createIconComponent('TableIcon', 'table')
export const TagIcon = createIconComponent('TagIcon', 'tag')
export const TasklistIcon = createIconComponent('TasklistIcon', 'tasklist')
export const TelescopeIcon = createIconComponent('TelescopeIcon', 'telescope')
export const TelescopeFillIcon = createIconComponent(
  'TelescopeFillIcon',
  'telescope-fill',
)
export const TerminalIcon = createIconComponent('TerminalIcon', 'terminal')
export const ThreeBarsIcon = createIconComponent('ThreeBarsIcon', 'three-bars')
export const ThumbsdownIcon = createIconComponent(
  'ThumbsdownIcon',
  'thumbsdown',
)
export const ThumbsupIcon = createIconComponent('ThumbsupIcon', 'thumbsup')
export const ToolsIcon = createIconComponent('ToolsIcon', 'tools')
export const TrackedByClosedCompletedIcon = createIconComponent(
  'TrackedByClosedCompletedIcon',
  'tracked-by-closed-completed',
)
export const TrackedByClosedNotPlannedIcon = createIconComponent(
  'TrackedByClosedNotPlannedIcon',
  'tracked-by-closed-not-planned',
)
export const TrashIcon = createIconComponent('TrashIcon', 'trash')
export const TriangleDownIcon = createIconComponent(
  'TriangleDownIcon',
  'triangle-down',
)
export const TriangleLeftIcon = createIconComponent(
  'TriangleLeftIcon',
  'triangle-left',
)
export const TriangleRightIcon = createIconComponent(
  'TriangleRightIcon',
  'triangle-right',
)
export const TriangleUpIcon = createIconComponent(
  'TriangleUpIcon',
  'triangle-up',
)
export const TrophyIcon = createIconComponent('TrophyIcon', 'trophy')
export const TypographyIcon = createIconComponent(
  'TypographyIcon',
  'typography',
)
export const UndoIcon = createIconComponent('UndoIcon', 'undo')
export const UnfoldIcon = createIconComponent('UnfoldIcon', 'unfold')
export const UnlinkIcon = createIconComponent('UnlinkIcon', 'unlink')
export const UnlockIcon = createIconComponent('UnlockIcon', 'unlock')
export const UnmuteIcon = createIconComponent('UnmuteIcon', 'unmute')
export const UnreadIcon = createIconComponent('UnreadIcon', 'unread')
export const UnverifiedIcon = createIconComponent(
  'UnverifiedIcon',
  'unverified',
)
export const UnwrapIcon = createIconComponent('UnwrapIcon', 'unwrap')
export const UploadIcon = createIconComponent('UploadIcon', 'upload')
export const VerifiedIcon = createIconComponent('VerifiedIcon', 'verified')
export const VersionsIcon = createIconComponent('VersionsIcon', 'versions')
export const VideoIcon = createIconComponent('VideoIcon', 'video')
export const VscodeIcon = createIconComponent('VscodeIcon', 'vscode')
export const WebhookIcon = createIconComponent('WebhookIcon', 'webhook')
export const WorkflowIcon = createIconComponent('WorkflowIcon', 'workflow')
export const WrapIcon = createIconComponent('WrapIcon', 'wrap')
export const XIcon = createIconComponent('XIcon', 'x')
export const XCircleIcon = createIconComponent('XCircleIcon', 'x-circle')
export const XCircleFillIcon = createIconComponent(
  'XCircleFillIcon',
  'x-circle-fill',
)
export const ZapIcon = createIconComponent('ZapIcon', 'zap')
export const ZoomInIcon = createIconComponent('ZoomInIcon', 'zoom-in')
export const ZoomOutIcon = createIconComponent('ZoomOutIcon', 'zoom-out')

export const iconComponents = {
  accessibility: AccessibilityIcon,
  'accessibility-inset': AccessibilityInsetIcon,
  agent: AgentIcon,
  'ai-model': AiModelIcon,
  alert: AlertIcon,
  'alert-fill': AlertFillIcon,
  apps: AppsIcon,
  archive: ArchiveIcon,
  'arrow-both': ArrowBothIcon,
  'arrow-down': ArrowDownIcon,
  'arrow-down-left': ArrowDownLeftIcon,
  'arrow-down-right': ArrowDownRightIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  'arrow-switch': ArrowSwitchIcon,
  'arrow-up': ArrowUpIcon,
  'arrow-up-left': ArrowUpLeftIcon,
  'arrow-up-right': ArrowUpRightIcon,
  beaker: BeakerIcon,
  bell: BellIcon,
  'bell-fill': BellFillIcon,
  'bell-slash': BellSlashIcon,
  blocked: BlockedIcon,
  bold: BoldIcon,
  book: BookIcon,
  'book-locked': BookLockedIcon,
  bookmark: BookmarkIcon,
  'bookmark-fill': BookmarkFillIcon,
  'bookmark-filled': BookmarkFilledIcon,
  'bookmark-slash': BookmarkSlashIcon,
  'bookmark-slash-fill': BookmarkSlashFillIcon,
  'boolean-off': BooleanOffIcon,
  'boolean-on': BooleanOnIcon,
  briefcase: BriefcaseIcon,
  broadcast: BroadcastIcon,
  browser: BrowserIcon,
  bug: BugIcon,
  cache: CacheIcon,
  calendar: CalendarIcon,
  check: CheckIcon,
  'check-circle': CheckCircleIcon,
  'check-circle-fill': CheckCircleFillIcon,
  checkbox: CheckboxIcon,
  'checkbox-fill': CheckboxFillIcon,
  checklist: ChecklistIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-up': ChevronUpIcon,
  circle: CircleIcon,
  'circle-slash': CircleSlashIcon,
  clock: ClockIcon,
  'clock-fill': ClockFillIcon,
  cloud: CloudIcon,
  'cloud-offline': CloudOfflineIcon,
  code: CodeIcon,
  'code-of-conduct': CodeOfConductIcon,
  'code-review': CodeReviewIcon,
  'code-square': CodeSquareIcon,
  codescan: CodescanIcon,
  'codescan-checkmark': CodescanCheckmarkIcon,
  codespaces: CodespacesIcon,
  columns: ColumnsIcon,
  'command-palette': CommandPaletteIcon,
  comment: CommentIcon,
  'comment-ai': CommentAiIcon,
  'comment-discussion': CommentDiscussionIcon,
  'comment-locked': CommentLockedIcon,
  compose: ComposeIcon,
  container: ContainerIcon,
  copilot: CopilotIcon,
  'copilot-error': CopilotErrorIcon,
  'copilot-warning': CopilotWarningIcon,
  copy: CopyIcon,
  cpu: CpuIcon,
  'credit-card': CreditCardIcon,
  'cross-reference': CrossReferenceIcon,
  crosshairs: CrosshairsIcon,
  dash: DashIcon,
  database: DatabaseIcon,
  dependabot: DependabotIcon,
  'desktop-download': DesktopDownloadIcon,
  'device-camera': DeviceCameraIcon,
  'device-camera-video': DeviceCameraVideoIcon,
  'device-desktop': DeviceDesktopIcon,
  'device-mobile': DeviceMobileIcon,
  devices: DevicesIcon,
  diamond: DiamondIcon,
  dice: DiceIcon,
  diff: DiffIcon,
  'diff-added': DiffAddedIcon,
  'diff-ignored': DiffIgnoredIcon,
  'diff-modified': DiffModifiedIcon,
  'diff-removed': DiffRemovedIcon,
  'diff-renamed': DiffRenamedIcon,
  'discussion-closed': DiscussionClosedIcon,
  'discussion-duplicate': DiscussionDuplicateIcon,
  'discussion-outdated': DiscussionOutdatedIcon,
  dot: DotIcon,
  'dot-fill': DotFillIcon,
  download: DownloadIcon,
  duplicate: DuplicateIcon,
  ellipsis: EllipsisIcon,
  exclamation: ExclamationIcon,
  eye: EyeIcon,
  'eye-closed': EyeClosedIcon,
  'feed-discussion': FeedDiscussionIcon,
  'feed-forked': FeedForkedIcon,
  'feed-heart': FeedHeartIcon,
  'feed-issue-closed': FeedIssueClosedIcon,
  'feed-issue-draft': FeedIssueDraftIcon,
  'feed-issue-open': FeedIssueOpenIcon,
  'feed-issue-reopen': FeedIssueReopenIcon,
  'feed-merged': FeedMergedIcon,
  'feed-person': FeedPersonIcon,
  'feed-plus': FeedPlusIcon,
  'feed-public': FeedPublicIcon,
  'feed-pull-request-closed': FeedPullRequestClosedIcon,
  'feed-pull-request-draft': FeedPullRequestDraftIcon,
  'feed-pull-request-open': FeedPullRequestOpenIcon,
  'feed-repo': FeedRepoIcon,
  'feed-rocket': FeedRocketIcon,
  'feed-star': FeedStarIcon,
  'feed-tag': FeedTagIcon,
  'feed-trophy': FeedTrophyIcon,
  file: FileIcon,
  'file-added': FileAddedIcon,
  'file-badge': FileBadgeIcon,
  'file-binary': FileBinaryIcon,
  'file-check': FileCheckIcon,
  'file-code': FileCodeIcon,
  'file-diff': FileDiffIcon,
  'file-directory': FileDirectoryIcon,
  'file-directory-fill': FileDirectoryFillIcon,
  'file-directory-open-fill': FileDirectoryOpenFillIcon,
  'file-directory-symlink': FileDirectorySymlinkIcon,
  'file-media': FileMediaIcon,
  'file-moved': FileMovedIcon,
  'file-removed': FileRemovedIcon,
  'file-submodule': FileSubmoduleIcon,
  'file-symlink-file': FileSymlinkFileIcon,
  'file-zip': FileZipIcon,
  filter: FilterIcon,
  'filter-remove': FilterRemoveIcon,
  'fiscal-host': FiscalHostIcon,
  flame: FlameIcon,
  flowchart: FlowchartIcon,
  'focus-center': FocusCenterIcon,
  fold: FoldIcon,
  'fold-down': FoldDownIcon,
  'fold-up': FoldUpIcon,
  gear: GearIcon,
  gift: GiftIcon,
  'git-branch': GitBranchIcon,
  'git-branch-check': GitBranchCheckIcon,
  'git-commit': GitCommitIcon,
  'git-compare': GitCompareIcon,
  'git-merge': GitMergeIcon,
  'git-merge-queue': GitMergeQueueIcon,
  'git-pull-request': GitPullRequestIcon,
  'git-pull-request-closed': GitPullRequestClosedIcon,
  'git-pull-request-draft': GitPullRequestDraftIcon,
  'git-pull-request-locked': GitPullRequestLockedIcon,
  globe: GlobeIcon,
  goal: GoalIcon,
  grabber: GrabberIcon,
  graph: GraphIcon,
  'graph-bar-horizontal': GraphBarHorizontalIcon,
  'graph-bar-vertical': GraphBarVerticalIcon,
  hash: HashIcon,
  heading: HeadingIcon,
  heart: HeartIcon,
  'heart-fill': HeartFillIcon,
  history: HistoryIcon,
  home: HomeIcon,
  'home-fill': HomeFillIcon,
  'horizontal-rule': HorizontalRuleIcon,
  hourglass: HourglassIcon,
  hubot: HubotIcon,
  'id-badge': IdBadgeIcon,
  image: ImageIcon,
  inbox: InboxIcon,
  'inbox-fill': InboxFillIcon,
  infinity: InfinityIcon,
  info: InfoIcon,
  'issue-closed': IssueClosedIcon,
  'issue-draft': IssueDraftIcon,
  'issue-locked': IssueLockedIcon,
  'issue-opened': IssueOpenedIcon,
  'issue-reopened': IssueReopenedIcon,
  'issue-tracked-by': IssueTrackedByIcon,
  'issue-tracks': IssueTracksIcon,
  italic: ItalicIcon,
  iterations: IterationsIcon,
  'kebab-horizontal': KebabHorizontalIcon,
  key: KeyIcon,
  'key-asterisk': KeyAsteriskIcon,
  law: LawIcon,
  'light-bulb': LightBulbIcon,
  link: LinkIcon,
  'link-external': LinkExternalIcon,
  'list-ordered': ListOrderedIcon,
  'list-unordered': ListUnorderedIcon,
  location: LocationIcon,
  lock: LockIcon,
  'lockup-github': LockupGithubIcon,
  log: LogIcon,
  'logo-gist': LogoGistIcon,
  'logo-github': LogoGithubIcon,
  loop: LoopIcon,
  mail: MailIcon,
  'mark-github': MarkGithubIcon,
  markdown: MarkdownIcon,
  maximize: MaximizeIcon,
  mcp: McpIcon,
  megaphone: MegaphoneIcon,
  mention: MentionIcon,
  meter: MeterIcon,
  milestone: MilestoneIcon,
  minimize: MinimizeIcon,
  mirror: MirrorIcon,
  moon: MoonIcon,
  'mortar-board': MortarBoardIcon,
  'move-to-bottom': MoveToBottomIcon,
  'move-to-end': MoveToEndIcon,
  'move-to-start': MoveToStartIcon,
  'move-to-top': MoveToTopIcon,
  'multi-select': MultiSelectIcon,
  mute: MuteIcon,
  'no-entry': NoEntryIcon,
  'no-entry-fill': NoEntryFillIcon,
  node: NodeIcon,
  'north-star': NorthStarIcon,
  note: NoteIcon,
  number: NumberIcon,
  organization: OrganizationIcon,
  package: PackageIcon,
  'package-dependencies': PackageDependenciesIcon,
  'package-dependents': PackageDependentsIcon,
  paintbrush: PaintbrushIcon,
  'paper-airplane': PaperAirplaneIcon,
  paperclip: PaperclipIcon,
  'passkey-fill': PasskeyFillIcon,
  paste: PasteIcon,
  pause: PauseIcon,
  pencil: PencilIcon,
  'pencil-ai': PencilAiIcon,
  people: PeopleIcon,
  person: PersonIcon,
  'person-add': PersonAddIcon,
  'person-fill': PersonFillIcon,
  pin: PinIcon,
  'pin-slash': PinSlashIcon,
  'pivot-column': PivotColumnIcon,
  play: PlayIcon,
  plug: PlugIcon,
  plus: PlusIcon,
  'plus-circle': PlusCircleIcon,
  project: ProjectIcon,
  'project-roadmap': ProjectRoadmapIcon,
  'project-symlink': ProjectSymlinkIcon,
  'project-template': ProjectTemplateIcon,
  pulse: PulseIcon,
  question: QuestionIcon,
  quote: QuoteIcon,
  read: ReadIcon,
  redo: RedoIcon,
  'rel-file-path': RelFilePathIcon,
  reply: ReplyIcon,
  repo: RepoIcon,
  'repo-clone': RepoCloneIcon,
  'repo-delete': RepoDeleteIcon,
  'repo-deleted': RepoDeletedIcon,
  'repo-forked': RepoForkedIcon,
  'repo-locked': RepoLockedIcon,
  'repo-pull': RepoPullIcon,
  'repo-push': RepoPushIcon,
  'repo-template': RepoTemplateIcon,
  report: ReportIcon,
  rocket: RocketIcon,
  rows: RowsIcon,
  rss: RssIcon,
  ruby: RubyIcon,
  sandbox: SandboxIcon,
  'screen-full': ScreenFullIcon,
  'screen-normal': ScreenNormalIcon,
  search: SearchIcon,
  server: ServerIcon,
  share: ShareIcon,
  'share-android': ShareAndroidIcon,
  shield: ShieldIcon,
  'shield-check': ShieldCheckIcon,
  'shield-lock': ShieldLockIcon,
  'shield-slash': ShieldSlashIcon,
  'shield-x': ShieldXIcon,
  'sidebar-collapse': SidebarCollapseIcon,
  'sidebar-expand': SidebarExpandIcon,
  'sign-in': SignInIcon,
  'sign-out': SignOutIcon,
  'single-select': SingleSelectIcon,
  skip: SkipIcon,
  'skip-fill': SkipFillIcon,
  sliders: SlidersIcon,
  smiley: SmileyIcon,
  'smiley-frown': SmileyFrownIcon,
  'smiley-frustrated': SmileyFrustratedIcon,
  'smiley-grin': SmileyGrinIcon,
  'smiley-neutral': SmileyNeutralIcon,
  'sort-asc': SortAscIcon,
  'sort-desc': SortDescIcon,
  space: SpaceIcon,
  'spacing-large': SpacingLargeIcon,
  'spacing-medium': SpacingMediumIcon,
  'spacing-small': SpacingSmallIcon,
  sparkle: SparkleIcon,
  'sparkle-fill': SparkleFillIcon,
  'sparkles-fill': SparklesFillIcon,
  'split-view': SplitViewIcon,
  'sponsor-tiers': SponsorTiersIcon,
  square: SquareIcon,
  'square-circle': SquareCircleIcon,
  'square-fill': SquareFillIcon,
  squirrel: SquirrelIcon,
  stack: StackIcon,
  'stack-check': StackCheckIcon,
  'stack-remove': StackRemoveIcon,
  star: StarIcon,
  'star-fill': StarFillIcon,
  stop: StopIcon,
  stopwatch: StopwatchIcon,
  strikethrough: StrikethroughIcon,
  sun: SunIcon,
  sync: SyncIcon,
  tab: TabIcon,
  'tab-external': TabExternalIcon,
  table: TableIcon,
  tag: TagIcon,
  tasklist: TasklistIcon,
  telescope: TelescopeIcon,
  'telescope-fill': TelescopeFillIcon,
  terminal: TerminalIcon,
  'three-bars': ThreeBarsIcon,
  thumbsdown: ThumbsdownIcon,
  thumbsup: ThumbsupIcon,
  tools: ToolsIcon,
  'tracked-by-closed-completed': TrackedByClosedCompletedIcon,
  'tracked-by-closed-not-planned': TrackedByClosedNotPlannedIcon,
  trash: TrashIcon,
  'triangle-down': TriangleDownIcon,
  'triangle-left': TriangleLeftIcon,
  'triangle-right': TriangleRightIcon,
  'triangle-up': TriangleUpIcon,
  trophy: TrophyIcon,
  typography: TypographyIcon,
  undo: UndoIcon,
  unfold: UnfoldIcon,
  unlink: UnlinkIcon,
  unlock: UnlockIcon,
  unmute: UnmuteIcon,
  unread: UnreadIcon,
  unverified: UnverifiedIcon,
  unwrap: UnwrapIcon,
  upload: UploadIcon,
  verified: VerifiedIcon,
  versions: VersionsIcon,
  video: VideoIcon,
  vscode: VscodeIcon,
  webhook: WebhookIcon,
  workflow: WorkflowIcon,
  wrap: WrapIcon,
  x: XIcon,
  'x-circle': XCircleIcon,
  'x-circle-fill': XCircleFillIcon,
  zap: ZapIcon,
  'zoom-in': ZoomInIcon,
  'zoom-out': ZoomOutIcon,
} as const satisfies Record<OcticonName, Icon>
