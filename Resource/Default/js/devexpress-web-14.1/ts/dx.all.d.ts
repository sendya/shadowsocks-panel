/// <reference path="jquery.d.ts" />
declare module DevExpress {
export function abstract(): void;
    export var rtlEnabled: boolean;
    export var hardwareBackButton: JQueryCallback;
    interface Endpoint {
        local?: string;
        production: string;
    }
    class EndpointSelector {
        constructor(config: { [key: string]: Endpoint });
        urlFor(key: string): string;
    }
    export interface ActionOptions {
        context?: Object;
        component?: any;
        beforeExecute? (e:ActionExecuteArgs): void;
        afterExecute? (e:ActionExecuteArgs): void;
    }
    export interface ActionExecuteArgs {
        action: any;
        args: any[];
        context: any;
        component: any;
        cancel: boolean;
        handled: boolean;
    }
    export class Action {
        constructor(action?: any, config?: ActionOptions);
        execute(): any;
    }
    export interface IDevice {
        deviceType?: string;
        platform?: string;
        version?: Array<number>;
        phone?: boolean;
        tablet?: boolean;
        android?: boolean;
        ios?: boolean;
        win8?: boolean;
        tizen?: boolean;
        generic?: boolean;
    }
    export module devices {
        export function orientation(): string;
        export var orientationChanged: JQueryCallback;
        export function real(): IDevice;
        export function current(deviceOrName: string): IDevice;
        export function current(deviceOrName: IDevice): IDevice;
    }
        export function registerComponent(name: string, componentClass: any): void;
    export interface ComponentOptions {
        disabled?: boolean;
    }
    export class Component {
        constructor(element: Element, options?: ComponentOptions);
        constructor(element: JQuery, options?: ComponentOptions);
        disposing: JQueryCallback;
        optionChanged: JQueryCallback;
        instance(): Component;
        beginUpdate(): void;
        endUpdate(): void;
        option(): any;
        option(options: string): any;
        option<T>(options: string): T;
        option(options: string, value: any): void;
        option(options: { [key: string]: any }): void;
        option(options?: any): any;
    }
    export interface DOMComponentOptions extends ComponentOptions {
        rtlEnabled?: boolean;
    }
    export class DOMComponent extends Component {
        constructor(element: HTMLElement, options?: DOMComponentOptions);
                static defaultOptions(rule: {
            device: any;
            options: { [key: string]: any };
        }): void;
    }
}
declare module DevExpress.data {
export interface DataError extends Error {
        httpStatus?: number;
        errorDetails?: any;
    }
    export interface ErrorHandler { (e: DataError): void; }
    export interface EntityOptions { key: any; keyType: any; }
    export interface Getter { (obj: any, options?: any): any; }
    export interface Setter { (obj: any, value: any, options?: any): void; }
    export interface QueryOptions {
        errorHandler?: ErrorHandler;
        requireTotalCount?: boolean;
    }
    export interface ODataQueryOptions extends QueryOptions {
        adapter?: any;
    }
    interface IQuery {
        enumerate(): JQueryPromise<Array<any>>;
        count(): JQueryPromise<number>;
        slice(skip: number, take?: number): IQuery;
        sortBy(field: string): IQuery;
        sortBy(field: Getter): IQuery;
        sortBy(field: { field: string; desc?: boolean }): IQuery;
        sortBy(field: { field: Getter; desc?: boolean }): IQuery;
        thenBy(field: string): IQuery;
        thenBy(field: Getter): IQuery;
        thenBy(field: { field: string; desc?: boolean }): IQuery;
        thenBy(field: { field: Getter; desc?: boolean }): IQuery;
        filter(field: string, operator: string, value: any): IQuery;
        filter(field: string, value: any): IQuery;
        filter(criteria: any[]): IQuery;
        select(field: string): IQuery;
        select(field: string[]): IQuery;
        select(...field: string[]): IQuery;
        select(field: Getter): IQuery;
        select(field: Getter[]): IQuery;
        select(...field: Getter[]): IQuery;
        groupBy(field: string[]): IQuery;
        groupBy(field: Getter[]): IQuery;
        groupBy(field: { field: string; desc?: boolean }[]): IQuery;
        groupBy(field: { field: Getter; desc?: boolean }[]): IQuery;
        sum(getter?: string): JQueryPromise<number>;
        min(getter?: string): JQueryPromise<any>;
        max(getter?: string): JQueryPromise<any>;
        avg(getter?: string): JQueryPromise<any>;
        aggregate(step: number): JQueryPromise<any>;
        aggregate(seed: number, step: (accumulator: any, current: any) => any, finalize?: (accumulator: any) => any): JQueryPromise<any>;
    }
    export interface ArrayQuery extends IQuery {
        toArray(): Array<any>;
    }
    export interface RemoteQuery extends IQuery { /*todo: exec() ? */ }
    export function base64_encode(input: string): string;
    export function base64_encode(input: any[]): string;
    export function query(items?: any[]): IQuery;
    export var queryImpl: {
        remote: (url: string, queryOptions: QueryOptions) => RemoteQuery;
        array: (iter: Array<any>, queryOptions: QueryOptions) => ArrayQuery;
    };
    export class Guid {
        constructor(value?: string);
        constructor(value?: any);
        toString(): string;
        valueOf(): string;
        toJSON(): string;
    }
    export class EdmLiteral {
        constructor(value: any);
        valueOf(): any;
    }
    export module utils {
        export function normalizeSortingInfo(info: string): Array<{ selector: string; desc?: boolean }>;
        export function normalizeSortingInfo(info: string[]): Array<{ selector: string; desc?: boolean }>;
        export function normalizeSortingInfo(info: Getter): Array<{ selector: string; desc?: boolean }>;
        export function normalizeSortingInfo(info: Getter[]): Array<{ selector: string; desc?: boolean }>;
        export function normalizeSortingInfo(info: { field: string; dir?: string }): Array<{ selector: string; desc?: boolean }>;
        export function normalizeSortingInfo(info: { field: string; dir?: string }[]): Array<{ selector: string; desc?: boolean }>;
        export function normalizeSortingInfo(info: { field: string; desc?: boolean }): Array<{ selector: string; desc?: boolean }>;
        export function normalizeSortingInfo(info: { field: string; desc?: boolean }[]): Array<{ selector: string; desc?: boolean }>;
        export function normalizeSortingInfo(info: { selector: string; dir?: string }): Array<{ selector: string; desc?: boolean }>;
        export function normalizeSortingInfo(info: { selector: string; dir?: string }[]): Array<{ selector: string; desc?: boolean }>;
        export function normalizeSortingInfo(info: { selector: string; desc?: boolean }): Array<{ selector: string; desc?: boolean }>;
        export function normalizeSortingInfo(info: { selector: string; desc?: boolean }[]): Array<{ selector: string; desc?: boolean }>;
        export function normalizeBinaryCriterion(criteria: Array<any>): Array<any>;
        export function keysEqual(key1: any, key2: any): boolean;
        export function keysEqual(keyExpr: any, key1: any, key2: any): boolean;
        export function toComparable(value: Date, caseSensitive?: boolean): number;
        export function toComparable(value: Guid, caseSensitive?: boolean): string;
        export function toComparable(value: string, caseSensitive?: boolean): string;
        export function compileGetter(): Getter;
        export function compileGetter(expr: any[]): Getter;
        export function compileGetter(expr: string): Getter;
        export function compileGetter(expr: "this"): Getter;
        export function compileGetter(expr: Getter): Getter;
        export function compileSetter(expr: string): Setter;
        export module odata {
            export function sendRequest(request: JQueryXHR, requestOptions?: JQueryAjaxSettings): any;
            export function serializePropName(propName: EdmLiteral): string;
            export function serializePropName(propName: string): string;
            export function serializeValue(value: Date): string;
            export function serializeValue(value: Guid): string;
            export function serializeValue(value: string): string;
            export function serializeValue(value: "string"): string;
            export function serializeValue(value: EdmLiteral): string;
            export function serializeKey(key: any): string;
            export function serializeKey(key: Date): string;
            export function serializeKey(key: Guid): string;
            export function serializeKey(key: string): string;
            export function serializeKey(key: "string"): string;
            export function serializeKey(key: EdmLiteral): string;
            export var keyConverters: {
                String(value: any): string;
                Guid(value: any): Guid;
                Int32(value: any): number;
                Int64(value: any): EdmLiteral;
            };
        }
    }
    export module queryAdapters {
        export function odata(queryOptions: ODataQueryOptions): RemoteQuery;
    }
export interface DataSourceOptions {
        map? (item: any): any;
        postProcess? (result: any[]): any;
        pageSize: number;
        paginate: boolean;
    }
    export class DataSource {
        public changed: JQueryCallback;
        public loadError: JQueryCallback;
        public loadingChanged: JQueryCallback;
        constructor(options?: Store);
        constructor(options?: string);
        constructor(options?: Array<any>);
        constructor(options?: { store: Store });
        constructor(options?: CustomStoreOptions);
        constructor(options?: { store: Array<any> });
        constructor(options?: { store: { type: string } });
        constructor(options?: { load(options?: LoadOptions): JQueryXHR; });
        constructor(options?: { load(options?: LoadOptions): Array<any>; });
        constructor(options?: { load(options?: LoadOptions): JQueryPromise<any>; });
        constructor(options?: DataSourceOptions);
        loadOptions(): { [key: string]: any };
        items(): Array<any>;
        store(): data.Store;
        isLastPage(): boolean;
        pageIndex(newIndex?: number): number;
        sort(expr: any[]): any[];
        group(expr: any[]): any[];
        filter(expr: any[]): any[];
        select(expr: string[]): string[];
        searchValue(value?: string): string;
        searchOperation(op?: string): string;
        searchExpr(selector: string): string;
        key(): any;
        isLoaded(): boolean;
        isLoading(): boolean;
        totalCount(): number;
        load(): JQueryPromise<any>;
        dispose(): void;
    }
export interface StoreOptions {
        key?: any;
        errorHandler?: ErrorHandler;
        loaded?: (result: Array<any>) => void;
        loading?: (loadOptions: LoadOptions) => void;
        modified?: () => void;
        modifying?: () => void;
        inserted?: (values: Object, key: any) => void;
        inserting?: (values: Object) => void;
        updated?: (key: any, values: Object) => void;
        updating?: (key: any, values: Object) => void;
        removed?: (key: any) => void;
        removing?: (key: any) => void;
    }
    export interface LoadOptions extends QueryOptions {
        skip?: number;
        take?: number;
        sort?: any;
        select?: any;
        filter?: any;
        group?: any;
        expand?: any;
    }
    export class Store {
        loaded: JQueryCallback;
        loading: JQueryCallback;
        modified: JQueryCallback;
        modifying: JQueryCallback;
        inserted: JQueryCallback;
        inserting: JQueryCallback;
        updated: JQueryCallback;
        updating: JQueryCallback;
        removed: JQueryCallback;
        removing: JQueryCallback;
        constructor(options?: StoreOptions);
        key(): any;
        keyOf(obj: any): any;
        load(options?: LoadOptions): JQueryPromise<any[]>;
        createQuery(options?: QueryOptions): IQuery;
        totalCount(options?: {
            filter?: any[];
            group?: string[];
        }): JQueryPromise<number>;
        byKey(key: any, extraOptions?: {
            expand?: string[]
        }): JQueryPromise<any>;
        remove(key: any): JQueryPromise<any>;
        insert(values: any): JQueryPromise<any>;
        update(key: any, values: any): JQueryPromise<any>;
    }
    export interface CustomStoreOptions extends StoreOptions {
        load? (options?: LoadOptions): any;
        byKey? (key: any): any;
        insert? (values: any): any;
        update? (key: any, values: any): any;
        remove? (key: any): any;
        totalCount? (options?: {
            filter?: any[];
            group?: string[];
        }): any;
    }
    export class CustomStore extends Store {
        constructor(options?: CustomStoreOptions);
    }
    export interface ArrayStoreOptions extends StoreOptions {
        data?: Array<any>
    }
    export class ArrayStore extends Store {
        constructor(options?: Array<any>);
        constructor(options?: ArrayStoreOptions);
    }
    export interface LocalStoreOptions extends ArrayStoreOptions {
        name: string;
    }
    export class LocalStore extends ArrayStore {
        constructor(options?: string);
        constructor(options?: LocalStoreOptions);
        clear(): void;
    }
    export interface ODataStoreOptions extends StoreOptions {
        url?: string;
        name?: string;
        keyType?: string;
        jsonp?: boolean;
        withCredentials?: boolean;
    }
    export class ODataStore extends Store {
        constructor(options?: ODataStoreOptions);
    }
    export interface ODataContextOptions {
        url: string;
        jsonp?: boolean;
        withCredentials?: boolean;
        errorHandler?: ErrorHandler;
        beforeSend?: () => any;
        entities?: {
            [entityAlias: string]: ODataStoreOptions;
        };
    }
    export class ODataContext {
        constructor(options?: ODataContextOptions);
        get(operationName: string, params: { [key: string]: any }): JQueryPromise<Array<any>>;
        invoke(operationName: string, params: { [key: string]: any }, httpMethod?: string): JQueryPromise<Array<any>>;
        objectLink(entityAlias: string, key: any): { __metadata: { uri: string }; };
    }
}
declare module DevExpress.framework {
export interface dxViewOptions {
        name: string;
        title?: string;
        layout?: string;
    }
    export class dxView extends Component {
        constructor(options?: dxViewOptions);
    }
    export interface dxLayoutOptions {
        name: string;
        controller: string;
    }
    export class dxLayout extends Component {
        constructor(options?: dxLayoutOptions);
    }
    export interface dxViewPlaceholderOptions {
        viewName: string;
    }
    export class dxViewPlaceholder extends Component {
        constructor(options?: dxLayoutOptions);
    }
    export interface dxTransitionOptions {
        name: string;
        type: string;
    }
    export class dxTransition extends Component {
        constructor(options?: dxLayoutOptions);
    }
    export interface dxContentPlaceholderOptions {
        name: string;
        transition: string;
    }
    export class dxContentPlaceholder extends Component {
        constructor(options?: dxLayoutOptions);
    }
    export interface dxContentOptions {
        targetPlaceholder: string;
    }
    export class dxContent extends Component {
        constructor(options?: dxLayoutOptions);
    }
    export interface dxCommandOptions extends ComponentOptions {
        id: string;
        action?: any;
        icon?: string;
        title?: string;
        iconSrc?: string;
        visible?: boolean;
    }
    export class dxCommand extends Component {
        public beforeExecute: JQueryCallback;
        public afterExecute: JQueryCallback;
        constructor(element: JQuery, options?: dxCommandOptions);
        constructor(element: Element, options?: dxCommandOptions);
        execute(): void;
    }
    export class dxCommandContainer extends Component {
        constructor(options: ComponentOptions);
        constructor(element: JQuery, options?: ComponentOptions);
        constructor(element: Element, options?: ComponentOptions);
    }
    export interface CommandMap {
        [containerId: string]: { commands: any[]; defaults?: any; }
    }
    export class CommandMapping {
        constructor();
        static defaultMapping: CommandMap;
        mapCommands(containerId: string, commandMappings: any[]): CommandMapping;
        unmapCommands(containerId: string, commandIds: string[]): void;
        getCommandMappingForContainer(commandId: string, containerId: string): any;
        load(config: CommandMap): CommandMapping;
    }
    interface IViewCache {
        viewRemoved: JQueryCallback;
        setView(key: string, viewInfo: any): void;
        removeView(key: string): any;
        hasView(viewInfo: any): boolean;
        getView(key: string): any;
        clear(): void;
    }
    export class ViewCache implements IViewCache {
        viewRemoved: JQueryCallback;
        constructor();
        setView(key: string, viewInfo: any): void;
        removeView(key: string): any;
        hasView(viewInfo: any): boolean;
        getView(key: string): any;
        clear(): void;
    }
    export class NullViewCache implements IViewCache {
        viewRemoved: JQueryCallback;
        constructor();
        setView(key: string, viewInfo: any): void;
        removeView(key: string): any;
        hasView(viewInfo: any): boolean;
        getView(key: string): any;
        clear(): void;
    }
    export class CapacityViewCacheDecorator implements IViewCache {
        viewRemoved: JQueryCallback;
        constructor(options: {
            size: number;
            viewCache: IViewCache;
        });
        setView(key: string, viewInfo: any): void;
        removeView(key: string): any;
        hasView(viewInfo: any): boolean;
        getView(key: string): any;
        clear(): void;
    }
    export class ConditionalViewCacheDecorator implements IViewCache {
        viewRemoved: JQueryCallback;
        constructor(options: {
            filter: (key: string, viewInfo: any) => boolean;
            viewCache: IViewCache;
        });
        setView(key: string, viewInfo: any): void;
        removeView(key: string): any;
        hasView(viewInfo: any): boolean;
        getView(key: string): any;
        clear(): void;
    }
    export class HistoryDependentViewCacheDecorator implements IViewCache {
        viewRemoved: JQueryCallback;
        constructor(options: {
            navigationManager: StackBasedNavigationManager;
            viewCache: IViewCache;
        });
        setView(key: string, viewInfo: any): void;
        removeView(key: string): any;
        hasView(viewInfo: any): boolean;
        getView(key: string): any;
        clear(): void;
    }
    export interface IStorage {
        getItem(key: string): any;
        setItem(key: string, value: any): void;
        removeItem(key: string): void;
    }
    export class MemoryKeyValueStorage implements IStorage {
        constructor();
        getItem(key: string): any;
        setItem(key: string, value: any): void;
        removeItem(key: string): void;
    }
    export interface StateManagerOptions {
        storage?: IStorage;
        stateSources?: any[];
    }
    export class StateManager {
        public storage: IStorage;
        public stateSources: any[];
        constructor(options?: StateManagerOptions);
        addStateSource(stateSource: any): void;
        removeStateSource(stateSource: any): void;
        saveState(): void;
        restoreState(): void;
        clearState(): void;
    }
    export class Route {
        constructor(pattern: string, defaults?: any, constraints?: any);
        parse(url: string): any;
        format(routeValues: any): string;
        formatSegment(value: any): string;
        parseSegment(): any;
    }
    export class MvcRouter {
        constructor();
        register(pattern: string, defaults?: any, constraints?: any): void;
        parse(uri: string): any;
        format(obj: any): string;
    }
    interface BrowserAdapterOptions {
        window: Window;
    }
    export class DefaultBrowserAdapter {
        constructor(options?: BrowserAdapterOptions);
        replaceState(uri: string): void;
        pushState(uri: string): void;
        createRootPage(): void;
        getWindowName(): string;
        setWindowName(windowName: string): void;
        back(): void;
        getHash(): string;
        isRootPage(): boolean;
    }
    export class OldBrowserAdapter extends DefaultBrowserAdapter { }
    export class HistorylessBrowserAdapter extends DefaultBrowserAdapter { }
    export interface INavigationDevice {
        init: Function;
        setUri(uri: string): void;
        getUri(): string;
        back(): void;
    }
    export class StackBasedNavigationDevice extends HistoryBasedNavigationDevice implements INavigationDevice {
        uriChanged: JQueryCallback;
        constructor(options?: BrowserAdapterOptions);
    }
    export class HistoryBasedNavigationDevice implements INavigationDevice {
        backInitiated: JQueryCallback;
        init: Function;
        setUri(uri: string): void;
        getUri(): string;
        back(): void;
    }
    export class NavigationStack {
        public items: any[];
        public currentIndex: number;
        public itemsRemoved: JQueryCallback;
        constructor();
        currentItem(): any;
        back(uri: string): void;
        forward(): void;
        navigate(uri: any, replaceCurrent?: boolean): any;
        getPreviousItem(): any;
        canBack(): boolean;
        clear(): void;
    }
    export interface NavigationManagerOptions {
        stateStorageKey?: string;
        navigationDevice?: INavigationDevice;
        keepPositionInStack?: boolean;
    }
    export interface INavigationManager {
        navigating: JQueryCallback;
        navigated: JQueryCallback;
        navigatingBack: JQueryCallback;
        navigationCanceled: JQueryCallback;
        itemRemoved: JQueryCallback;
        navigate(uri: any, options?: {
            root?: boolean;
            target?: string;
            direction?: string;
        }): void;
        back(): void;
        back(alternate: any): void;
        canBack(): boolean;
        rootUri(): string;
        currentItem(): any;
        previousItem(): any;
        saveState(): void;
        removeState(): void;
        restoreState(): void;
    }
    export class StackBasedNavigationManager extends HistoryBasedNavigationManager {
        init(): JQueryPromise<any>;
        public currentStack: NavigationStack;
        public navigationStacks: {
            [key: string]: NavigationStack
        };
        public navigating: JQueryCallback;
        public navigated: JQueryCallback;
        public navigatingBack: JQueryCallback;
        public navigationCanceled: JQueryCallback;
        public itemRemoved: JQueryCallback;
        constructor(options?: NavigationManagerOptions);
        navigate(uri: any, options?: {
            root?: boolean;
            target?: string;
            direction?: string;
        }): void;
        currentIndex(): number;
        getItemByIndex(index: number): any;
        clearHistory(): void;
    }
    export class HistoryBasedNavigationManager implements INavigationManager {
        navigating: JQueryCallback;
        navigated: JQueryCallback;
        navigatingBack: JQueryCallback;
        navigationCanceled: JQueryCallback;
        itemRemoved: JQueryCallback;
        constructor(options?: NavigationManagerOptions);
        navigate(uri: any, options?: {
            root?: boolean;
            target?: string;
            direction?: string;
        }): void;
        back(): void;
        back(alternate: any): void;
        canBack(): boolean;
        rootUri(): string;
        currentItem(): any;
        previousItem(): any;
        saveState(): void;
        removeState(): void;
        restoreState(): void;
    }
    export module utils {
        export function mergeCommands(destination: any, source: any): dxCommand[];
    }
    export interface ApplicationOptions {
        router?: MvcRouter;
        ns?: Object;
        namespace?: Object;
        viewCache?: IViewCache;
        viewCacheSize?: number;
        disableViewCache?: boolean;
        useViewTitleAsBackText?: boolean;
        stateManager?: StateManager;
        navigationManager?: StackBasedNavigationManager;
        navigation?: dxCommandOptions[];
        commandMapping?: CommandMap;
    }
    export class Application {
        public router: MvcRouter;
        public namespace: any;
        public components: any[];
        public viewCache: IViewCache;
        public stateManager: StateManager;
        public commandMapping: CommandMap;
        public navigation: dxCommand[];
        public navigationManager: StackBasedNavigationManager;
        public beforeViewSetup: JQueryCallback;
        public afterViewSetup: JQueryCallback;
        public viewShowing: JQueryCallback;
        public viewShown: JQueryCallback;
        public viewHidden: JQueryCallback;
        public viewDisposing: JQueryCallback;
        public viewDisposed: JQueryCallback;
        public navigating: JQueryCallback;
        public navigatingBack: JQueryCallback;
        constructor(options?: ApplicationOptions);
        init(): any;
        navigate(uri?: any, options?: {
            root?: boolean;
            target?: string;
            direction?: string;
        }): void;
        back(): void;
        canBack(): boolean;
        saveState(): void;
        clearState(): void;
        restoreState(): void;
    }
    export function createActionExecutors(app: Application): {
        [key: string]: { execute(e: any): void; }
    };
}
declare module DevExpress.framework.html {
export interface ILayoutController {
        viewReleased: JQueryCallback;
        init(options: InitLayoutControllerOptions): void;
        activate(): void;
        deactivate(): void;
        showView(viewInfo: any, direction?: string): JQueryPromise<any>;
    }
    export interface ILayoutControllerRegistration extends IDevice {
        name: string;
        controller: ILayoutController;
        root?: boolean;
    }
    export var layoutControllers: Array<ILayoutControllerRegistration>;
    export var layoutSets: Object;
    export interface InitLayoutControllerOptions {
        $viewPort?: JQuery;
        $hiddenBag?: JQuery;
        navigationManager?: framework.StackBasedNavigationManager;
    }
    export class DefaultLayoutController implements ILayoutController {
        public viewReleased: JQueryCallback;
        constructor(options?: { layoutTemplateName: string });
        init(options: InitLayoutControllerOptions): void;
        activate(): void;
        deactivate(): void;
        showView(viewInfo: any, direction?: string): JQueryPromise<any>;
    }
    export interface CommandManagerOptions {
        globalCommands?: framework.dxCommand[];
        commandMapping?: framework.CommandMapping;
    }
    export class CommandManager {
        public globalCommands: framework.dxCommand[];
        public commandMapping: framework.CommandMapping;
        constructor(options?: CommandManagerOptions);
        layoutCommands($markup: JQuery, extraCommands?: any): void;     }
    export interface ITemplateEngine {
        applyTemplate(template: string, model: any): void;
        applyTemplate(template: Element, model: any): void;
        applyTemplate(template: JQuery, model: any): void;
    }
    export class KnockoutJSTemplateEngine implements ITemplateEngine {
        constructor();
        applyTemplate(template: string, model: any): void;
        applyTemplate(template: Element, model: any): void;
        applyTemplate(template: JQuery, model: any): void;
    }
    export interface TransitionExecutorOptions {
        type?: string;
        source?: JQuery;
        destination?: JQuery;
    }
    export class TransitionExecutor {
        public container: JQuery;
        constructor(container: JQuery, options: TransitionExecutorOptions);
        finalize(): void;
        exec(): JQueryPromise<TransitionExecutorOptions>;
        static create(container: JQuery, options: TransitionExecutorOptions): TransitionExecutor;
    }
    export interface ViewEngineOptions {
        $root?: JQuery;
        device?: IDevice;
        commandManager?: CommandManager;
        templateEngine?: ITemplateEngine;
        dataOptionsAttributeName?: string;
    }
    export class ViewEngineBase {
        public $root: JQuery;
        public device: IDevice;
        public commandManager: CommandManager;
        public templateEngine: ITemplateEngine;
        public dataOptionsAttributeName: string;
        public viewSelecting: JQueryCallback;
        public modelFromViewDataExtended: JQueryCallback;
        constructor(options?: ViewEngineOptions);
        init(): JQueryPromise<any>;
        findViewTemplate(viewName: string): JQuery;
        afterViewSetup(viewInfo: any): void;
    }
    export class ViewEngine extends ViewEngineBase {
        public layoutSelecting: JQueryCallback;
        constructor(options?: ViewEngineOptions);
        init(): JQueryPromise<any>;
        findLayoutTemplate(layoutName: string): JQuery;
    }
    export interface HtmlApplicationOptions extends framework.ApplicationOptions {
        commandManager?: CommandManager;
        templateEngine?: ITemplateEngine;
        navigateToRootViewMode?: string;
        layoutControllers?: Array<ILayoutControllerRegistration>
        device?: IDevice;
        layoutSet?: Array<any>;
    }
    export class HtmlApplication extends framework.Application {
        public viewEngine: ViewEngineBase;
        public viewRendered: JQueryCallback;
        public resolveLayoutController: JQueryCallback;
        constructor(options?: HtmlApplicationOptions);
        init(): any;
        viewPort(): JQuery;
    }
}
declare module DevExpress.ui {
    interface ViewportOptions {
        allowPan?: boolean;
        allowZoom?: boolean;
    }
    export interface ITemplate {
        compile(html: string): any;
        render(template: JQuery, data: any): any;
        render(template: any, data: any): any;
    }
    class Template {
        constructor(element: HTMLElement);
        constructor(element: JQueryStatic);
        render(container: HTMLElement): any;
        render(container: JQueryStatic): any;
        dispose(): void;
    }
    interface TemplateStatic {
        new (element: HTMLElement): Template;
        new (element: JQueryStatic): Template;
    }
    class TemplateProvider {
        constructor();
        getTemplateClass(widget: any): TemplateStatic;
        getDefaultTemplate(widget: any): void;         supportDefaultTemplate(): boolean;
    }
    export function initViewport(options: ViewportOptions): void;
        interface NotifyOptions {
        message: string;
        type?: string;
        displayTime?: number;
        hiddenAction: () => any;
    }
    export function notyfy(options: any): void;
    export function notify(message: string, type?: string, displayTime?: number): void;
    export module dialog {
        interface Dialog {
            show(): JQueryPromise<any>;
            hide(value?: any): void;
        }
        interface DialogButton {
            text: string;
            icon: string;
            clickAction: () => any;
        }
        interface DialogOptions {
            message: string;
            title?: string;
        }
        export function custom(options: DialogOptions): Dialog;
        export function custom(message: string, title?: string): Dialog;
        export function alert(options: DialogOptions): JQueryPromise<boolean>;
        export function alert(message: string, title?: string): JQueryPromise<boolean>;
        export function confirm(options: DialogOptions): JQueryPromise<boolean>;
        export function confirm(message: string, title?: string): JQueryPromise<boolean>;
    }
export interface CollectionContainerWidgetOptions extends WidgetOptions {
        items?: Array<any>;
        itemTemplate?: any;
        itemRender?: Function;
        itemClickAction?: any;
        itemRenderedAction?: any;
        noDataText?: string;
        dataSource?: data.DataSource;
        selectedIndex?: number;
        itemSelectAction?: any;
        itemHoldAction?: any;
        itemHoldTimeout?: number;
    }
    export class CollectionContainerWidget extends Widget {
        constructor(element: Element, options?: CollectionContainerWidgetOptions);
        constructor(element: JQuery, options?: CollectionContainerWidgetOptions);
    }
export interface WidgetOptions extends ComponentOptions {
        contentReadyAction?: any;
        width?: any;
        height?: any;
        visible?: boolean;
        activeStateEnabled?: boolean;
    }
    export class Widget extends Component {
        constructor(element: Element, options?: WidgetOptions);
        constructor(element: JQuery, options?: WidgetOptions);
        init(): void;
        repaint(): void;
        addTemplate(template: ITemplate): void;
    }
export interface dxEditorOptions extends WidgetOptions {
        value?: any;
        valueChangeAction?: any;
    }
    export class dxEditor extends Widget {
        constructor(element: Element, options?: dxEditorOptions);
        constructor(element: JQuery, options?: dxEditorOptions);
    }
export interface dxAutocompleteOptions extends dxDropDownEditorOptions {
        minSearchLength?: number;
        searchTimeout?: number;
        placeholder?: string;
        filterOperator?: string;
        displayExpr?: string;
        searchMode?: string;
        dataSource?: data.DataSource;
        items?: Array<any>;
        itemRender?: Function;
        itemTemplate?: any;
    }
    export class dxAutocomplete extends dxDropDownEditor {
        constructor(element: Element, options?: dxAutocompleteOptions);
        constructor(element: JQuery, options?: dxAutocompleteOptions);
    }
export interface dxButtonOptions extends WidgetOptions {
        type?: string;
        text?: string;            
        icon?: string;
        iconSrc?: string;
    }
    export class dxButton extends Widget {
        constructor(element: Element, options?: dxButtonOptions);
        constructor(element: JQuery, options?: dxButtonOptions);
    }
export interface dxCheckBoxOptions extends dxEditorOptions { }
    export class dxCheckBox extends dxEditor {
        constructor(element: Element, options?: dxCheckBoxOptions);
        constructor(element: JQuery, options?: dxCheckBoxOptions);
    }
export interface dxCalendarOptions extends dxEditorOptions {
        value?: Date;
        min?: Date;
        max?: Date;
        firstDayOfWeek?: number;
    }
    export class dxCalendar extends dxEditor {
        constructor(element: Element, options?: dxEditorOptions);
        constructor(element: JQuery, options?: dxEditorOptions);
    }
export interface dxDateBoxOptions extends dxTextEditorOptions {
        format?: string;
        useNativePicker?: boolean;
        value?: Date;
        type?: string;
        min?: Date;
        max?: Date;
        useCalendar?: boolean;
        formatString?: string;
        closeOnValueChange?: boolean;
        calendarOptions?: Object;
    }
    export class dxDateBox extends dxTextEditor {
        constructor(element: Element, options?: dxDateBoxOptions);
        constructor(element: JQuery, options?: dxDateBoxOptions);
    }
export interface dxTextEditorOptions extends dxEditorOptions {
        valueChangeEvent?: string;
        placeholder?: string;
        readOnly?: boolean;
        focusInAction?: any;
        focusOutAction?: any;
        keyDownAction?: any;
        keyPressAction?: any;
        keyUpAction?: any;
        changeAction?: any;
        enterKeyAction?: any;
        copyAction?: any;
        pasteAction?: any;
        cutAction?: any;
        inputAction?: any;
        showClearButton?: boolean;
        mode?: string;
    }
    export class dxTextEditor extends dxEditor {
        constructor(element: Element, options?: dxTextEditorOptions);
        constructor(element: JQuery, options?: dxTextEditorOptions);
        focus(): void;
        blur(): void;
    }
export interface dxListOptions extends CollectionContainerWidgetOptions {
        pullRefreshEnabled?: boolean;
        autoPagingEnabled?: boolean;
        scrollingEnabled?: boolean;
        showScrollbar?: boolean;
        useNativeScrolling?: boolean;
        grouped?: boolean;
        editEnabled?: boolean;
        showNextButton?: boolean;
        groupTemplate?: string;
        pullingDownText?: string;
        pulledDownText?: string;
        refreshingText?: string;
        pageLoadingText?: string;
        scrollAction?: any;
        pullRefreshAction?: any;
        pageLoadingAction?: any;
        itemHoldAction?: any;
        itemSwipeAction?: any;
        itemHoldTimeout?: number;
        groupRender? (groupData: any, groupIndex: number, groupElement: Element): any;
        editConfig?: {
            itemTemplate?: any;
            itemRenderer? (itemData: any, itemIndex: number, itemElement: Element): any;
            menuType?: string;
            menuItems?: any[];
            deleteEnabled?: boolean;
            deleteMode?: string;
            selectionEnabled?: boolean;
            selectionMode?: string;
            selectionType?: string;
            reorderEnabled?: boolean;
        }
        itemDeleteAction?: any;
        selectedItems?: any[];
        itemSelectAction?: any;
        itemUnselectAction?: any;
        itemReorderAction?: any;
        nextButtonText?: string;
        selectionMode?: string;
    }
    export class dxList extends CollectionContainerWidget {
        constructor(element: Element, options?: dxListOptions);
        constructor(element: JQuery, options?: dxListOptions);
        update(): JQueryPromise<dxList>;
        updateDimensions(): JQueryPromise<dxList>;
        refresh(): JQueryPromise<dxList>;
        reload(): JQueryPromise<dxList>;
        deleteItem(itemElement: JQuery): JQueryPromise<dxList>;
        deleteItem(itemElement: Element): JQueryPromise<dxList>;
        clearSelectedItems() : void;
        isItemSelected(itemElement: JQuery): boolean;
        isItemSelected(itemElement: Element): boolean;
        selectItem(itemElement: JQuery): void;
        selectItem(itemElement: Element): void;
        unselectItem(itemElement: JQuery): void;
        unselectItem(itemElement: Element): void;
        reorderItem(itemElement: JQuery, toItemElement: JQuery): JQueryPromise<dxList>;
        reorderItem(itemElement: Element, toItemElement: Element): JQueryPromise<dxList>;
                getSelectedItems(): number[];
        clientHeight(): number;
        scrollHeight(): number;
        scrollBy(distance: number): void;
        scrollTo(targetLocation: number): void;
        scrollTop(): number;
    }
export interface dxLoadPanelOptions extends dxOverlayOptions {
        message?: string;
        width?: number;
        height?: number;
        delay?: number;
        showPane?: boolean;
        showIndicator?: boolean;
        indicatorSrc?: string;
    }
    export class dxLoadPanel extends dxOverlay {
        constructor(element: Element, options?: dxLoadPanelOptions);
        constructor(element: JQuery, options?: dxLoadPanelOptions);
        hide(): void;
        show(): void;
        toggle(showing: boolean): void;
    }
export interface dxLookupOptions extends dxEditorOptions {
        dataSource?: data.DataSource;
        displayValue?: string;
        title?: string;
        titleTemplate?: any;
        valueExpr?: string;
        displayExpr?: string;
        placeholder?: string;
        searchPlaceholder?: string;
        searchEnabled?: boolean;
        searchTimeout?: number;
        minFilterLength?: number;
        fullScreen?: boolean;
        itemTemplate?: any;
        itemRender?: Function;
        showCancelButton?: boolean;
        showClearButton?: boolean;
        showDoneButton?: boolean;
        showNextButton?: boolean;
        doneButtonText?: string;
        cancelButtonText?: string;
        clearButtonText?: string;
        nextButtonText?: string;
        grouped?: boolean;
        groupRender?: Function;
        groupTemplate?: string;
        pullingDownText?: string;
        pulledDownText?: string;
        refreshingText?: string;
        pageLoadingText?: string;
        noDataText?: string;
        scrollAction?: any;
        shading?: boolean;
        closeOnOutsideClick?: boolean;
        position?: any;
        animation?: any;
        shownAction?: any;
        hiddenAction?: any;
        popupWidth?: any;
        popupHeight?: any;
        autoPagingEnabled?: boolean;
        useNativeScrolling?: boolean;
        usePopover?: boolean;
        openAction?: any;
        closeAction?: any;
    }
    export class dxLookup extends dxEditor {
        constructor(element: Element, options?: dxLookupOptions);
        constructor(element: JQuery, options?: dxLookupOptions);
        close(): void;
        open(): void;
    }
export interface dxMapOptions extends WidgetOptions {
        location?: any;
        width?: number;
        height?: number;
        zoom?: number;
        mapType?: string;
        provider?: string;
        markers?: Array<any>;
        routes?: Array<any>;
        key?: string;
        controls?: any;
        mapReadyAction?: any;
        autoAdjust?: boolean;
        center?: any;
        markerAddedAction?: any;
        markerRemovedAction?: any;
        markerIconSrc?: string;
        routeAddedAction?: any;
        routeRemovedAction?: any;
        type?: string;
    }
    export class dxMap extends Widget {
        constructor(element: Element, options?: dxMapOptions);
        constructor(element: JQuery, options?: dxMapOptions);
        addMarker(markerOptions: any, callback: Function): JQueryPromise<any>;
        removeMarker(marker: any): void;
        addRoute(routeOptions: any, callback: Function): JQueryPromise<any>;
        removeRoute(route: any): void;
    }
export interface dxNavBarOptions extends dxTabsOptions { }
    export class dxNavBar extends dxTabs {
        constructor(element: Element, options?: dxNavBarOptions);
        constructor(element: JQuery, options?: dxNavBarOptions);
    }
export interface dxNumberBoxOptions extends dxTextEditorOptions {
        min?: number;
        max?: number;
        value?: number;
        step?: number;
        showSpinButtons?: boolean;
    }
    export class dxNumberBox extends dxTextEditor {
        constructor(element: Element, options?: dxNumberBoxOptions);
        constructor(element: JQuery, options?: dxNumberBoxOptions);
    }
export interface dxOverlayOptions extends WidgetOptions {
        activeStateEnabled?: boolean;
        shading?: boolean;
        closeOnOutsideClick?: boolean;
        position?: any;
        animation?: any;
        showingAction?: any;
        shownAction?: any;
        hidingAction?: any;
        hiddenAction?: any;
        deferRendering?: boolean;
        targetContainer?: any;
        contentTemplate?: any;
    }
    export class dxOverlay extends Widget {
        constructor(element: Element, options?: dxOverlayOptions);
        constructor(element: JQuery, options?: dxOverlayOptions);
        content(): JQuery;
        hide(): void;
        show(): void;
        toggle(showing: boolean): void;
    }
export interface dxPopupOptions extends dxOverlayOptions {
        title?: string;
        showTitle?: boolean;
        fullScreen?: boolean;
        cancelButton?: any;
        doneButton?: any;
        clearButton?: any;
        titleTemplate?: any;
        dragEnabled?: boolean;
    }
    export class dxPopup extends dxOverlay {
        constructor(element: Element, options?: dxPopupOptions);
        constructor(element: JQuery, options?: dxPopupOptions);
    }
export interface dxPopoverOptions extends dxPopupOptions {
        target?: any;
    }
    export class dxPopover extends dxPopup {
        constructor(element: Element, options?: dxPopoverOptions);
        constructor(element: JQuery, options?: dxPopoverOptions);
    }
export interface dxTooltipOptions extends dxPopoverOptions {
        target?: any;
    }
    export class dxTooltip extends dxPopover {
        constructor(element: Element, options?: dxTooltipOptions);
        constructor(element: JQuery, options?: dxTooltipOptions);
    }
export interface dxRadioGroupOptions extends CollectionContainerWidgetOptions {
        layout?: string;
        name?: string;
        value?: Object;
        valueExpr?: string;
    }
    export class dxRadioGroup extends CollectionContainerWidget {
        constructor(element: Element, options?: dxRadioGroupOptions);
        constructor(element: JQuery, options?: dxRadioGroupOptions);
    }
export interface dxRangeSliderOptions extends dxSliderOptions {
        start?: number;
        end?: number;
    }
    export class dxRangeSlider extends dxSlider {
        constructor(element: Element, options?: dxRangeSliderOptions);
        constructor(element: JQuery, options?: dxRangeSliderOptions);
    }
export interface dxScrollableOptions extends ComponentOptions {
        startAction?: any;
        scrollAction?: any;
        endAction?: any;
        stopAction?: any;
        inertiaAction?: any;
        bounceAction?: any;
        updateAction?: any;
        bounceEnabled?: boolean;
        direction?: string;
        showScrollbar?: boolean;
        useNative?: boolean;
    }
    export class dxScrollable extends Component {
        constructor(element: Element, options?: dxScrollableOptions);
        constructor(element: JQuery, options?: dxScrollableOptions);
        update(): void;
        content(): JQuery;
        clientHeight(): number;
        scrollHeight(): number;
        clientWidth(): number;
        scrollWidth(): number;
        scrollLeft(): number;
        scrollTop(): number;
        scrollOffset(): Object;
        scrollBy(distance: number): void;
        scrollBy(distance: Object): void;
        scrollTo(targetLocation: number): void;
        scrollTo(targetLocation: Object): void;
    }
export interface dxScrollViewOptions extends dxScrollableOptions {
        pullingDownText?: string;
        pulledDownText?: string;
        refreshingText?: string;
        reachBottomText?: string;
        pullDownAction?: any;
        reachBottomAction?: any;
    }
    export class dxScrollView extends dxScrollable {
        constructor(element: Element, options?: dxScrollViewOptions);
        constructor(element: JQuery, options?: dxScrollViewOptions);
        release(preventReachBottom: boolean): JQueryPromise<any>;
        toggleLoading(showOrHide: boolean): void;
        refresh(): void;
    }
export interface dxSelectBoxOptions extends dxAutocompleteOptions {
        fieldTemplate?: any;
        displayValue?: string;
        multiSelectEnabled?: boolean;
        values?: any[];
        openAction?: any;
        closeAction?: any;
    }
    export class dxSelectBox extends dxAutocomplete {
        constructor(element: Element, options?: dxSelectBoxOptions);
        constructor(element: JQuery, options?: dxSelectBoxOptions);
    }
export interface dxSliderOptions extends dxEditorOptions {
        min?: number;
        max?: number;
        step?: number;
        showRange?: boolean;
        label?: {
            visible: boolean;
            format?: any;
            position?: string;
        }
        tooltip?: {
            enabled?: boolean;
            format?: any;
            position?: string;
            showMode?: string;
        }
    }
    export class dxSlider extends dxEditor {
        constructor(element: Element, options?: dxSliderOptions);
        constructor(element: JQuery, options?: dxSliderOptions);
    }
export interface dxTabsOptions extends CollectionContainerWidgetOptions { }
    export class dxTabs extends CollectionContainerWidget {
        constructor(element: Element, options?: dxTabsOptions);
        constructor(element: JQuery, options?: dxTabsOptions);
    }
export interface dxTextAreaOptions extends dxTextEditorOptions {
        cols?: number;
        rows?: number;
    }
    export class dxTextArea extends dxTextEditor {
        constructor(element: Element, options?: dxTextAreaOptions);
        constructor(element: JQuery, options?: dxTextAreaOptions);
    }
export interface dxTextBoxOptions extends dxTextEditorOptions {
        maxLength?: any;
    }
    export class dxTextBox extends dxTextEditor {
        constructor(element: Element, options?: dxTextBoxOptions);
        constructor(element: JQuery, options?: dxTextBoxOptions);
    }
export interface dxToastOptions extends dxOverlayOptions {
        message?: string;
        type?: string;
        displayTime?: number;
    }
    export class dxToast extends dxOverlay {
        constructor(element: Element, options?: dxToastOptions);
        constructor(element: JQuery, options?: dxToastOptions);
    }
export interface dxToolbarOptions extends CollectionContainerWidgetOptions {
        menuItemRender?: Function;
        menuItemTemplate?: any;
        submenuType?: string;
        renderAs?: string;
    }
    export class dxToolbar extends CollectionContainerWidget {
        constructor(element: Element, options?: dxToolbarOptions);
        constructor(element: JQuery, options?: dxToolbarOptions);
    }
export interface dxDropDownEditorOptions extends dxTextBoxOptions {
        closeAction?: any;
        openAction?: any;
    }
    export class dxDropDownEditor extends dxTextBox {
        constructor(element: Element, options?: dxDropDownEditorOptions);
        constructor(element: JQuery, options?: dxDropDownEditorOptions);
    }
export interface dxLoadIndicatorOptions extends WidgetOptions {
        indicatorSrc?: string;
    }
    export class dxLoadIndicator extends Widget {
        constructor(element: Element, options?: dxLoadIndicatorOptions);
        constructor(element: JQuery, options?: dxLoadIndicatorOptions);
    }
export interface dxMultiViewOptions extends CollectionContainerWidgetOptions {
        loop?: boolean;
        swipeEnabled?: boolean;
        animationEnabled?: boolean;
        selectedIndex?: number;
    }
    export class dxMultiView extends CollectionContainerWidget {
        constructor(element: Element, options?: dxMultiViewOptions);
        constructor(element: JQuery, options?: dxMultiViewOptions);
    }
export interface dxGalleryOptions extends CollectionContainerWidgetOptions {
        activeStateEnabled?: boolean;
        animationDuration?: number;
        loop?: boolean;
        swipeEnabled?: boolean;
        indicatorEnabled?: boolean;
        showIndicator?: boolean;
        selectedIndex?: number;
        slideshowDelay?: number;
        showNavButtons?: boolean;
    }
    export class dxGallery extends CollectionContainerWidget {
        constructor(element: Element, options?: dxGalleryOptions);
        constructor(element: JQuery, options?: dxGalleryOptions);
        goToItem(itemIndex?: number, animation?: boolean): JQueryPromise<dxGallery>;
        prevItem(animation?: boolean): JQueryPromise<dxGallery>;
        nextItem(animation?: boolean): JQueryPromise<dxGallery>;
    }
export interface dxActionSheetOptions extends CollectionContainerWidgetOptions {
        usePopover?: boolean;
        target?: any;
        title?: string;
        showTitle?: boolean;
        cancelText?: string;
        noDataText?: string;
        cancelClickAction?: any;
        showCancelButton?: boolean;
    }
    export class dxActionSheet extends CollectionContainerWidget {
        constructor(element: Element, options?: dxActionSheetOptions);
        constructor(element: JQuery, options?: dxActionSheetOptions);
        toggle(): void;
        show(): void;
        hide(): void;
    }
export interface dxDropDownMenuOptions extends WidgetOptions {
        items?: Array<any>;
        itemClickAction?: any;
        dataSource?: data.DataSource;
        itemTemplate?: any;
        itemRender?: Function;
        buttonText?: string;
        buttonIcon?: string;
        buttonIconSrc?: string;
        buttonClickAction?: any;
        usePopover?: boolean;
    }
    export class dxDropDownMenu extends Widget {
        constructor(element: Element, options?: dxDropDownMenuOptions);
        constructor(element: JQuery, options?: dxDropDownMenuOptions);
    }
export interface dxPanoramaOptions extends CollectionContainerWidgetOptions {
        title?: string;
        backgroundImage?: any;
    }
    export class dxPanorama extends CollectionContainerWidget {
        constructor(element: Element, options?: dxPanoramaOptions);
        constructor(element: JQuery, options?: dxPanoramaOptions);
    }
export interface dxPivotOptions extends CollectionContainerWidgetOptions { }
    export class dxPivot extends CollectionContainerWidget {
        constructor(element: Element, options?: dxPivotOptions);
        constructor(element: JQuery, options?: dxPivotOptions);
    }
export interface dxSwitchOptions extends dxEditorOptions {
        onText?: string;
        offText?: string;
    }
    export class dxSwitch extends dxEditor {
        constructor(element: Element, options?: dxSwitchOptions);
        constructor(element: JQuery, options?: dxSwitchOptions);
    }
export interface dxTileViewOptions extends CollectionContainerWidgetOptions {
        bounceEnabled?: boolean;
        showScrollbar?: boolean;
        listHeight?: number;
        baseItemWidth?: number;
        baseItemHeight?: number;
        itemMargin?: number;
    }
    export class dxTileView extends CollectionContainerWidget {
        constructor(element: Element, options?: dxTileViewOptions);
        constructor(element: JQuery, options?: dxTileViewOptions);
    }
export interface dxSlideOutOptions extends CollectionContainerWidgetOptions {
        activeStateEnabled?: boolean;
        menuItemRender? (itemData: any, itemIndex: number, itemElement: Element): any;
        menuItemTemplate?: any;
        swipeEnabled?: boolean;
        menuVisible?: boolean;
        menuGrouped?: boolean;
        menuGroupRender? (groupData: any, groupIndex: number, groupElement: Element): any;
        menuGroupTemplate?: any;
    }
    export class dxSlideOut extends CollectionContainerWidget {
        constructor(element: Element, options?: dxSlideOutOptions);
        constructor(element: JQuery, options?: dxSlideOutOptions);
        showMenu(): JQueryPromise<dxSlideOut>;
        hideMenu(): JQueryPromise<dxSlideOut>;
        toggleMenuVisibility(showing?: boolean): JQueryPromise<dxSlideOut>;
    }
export interface dxDataGridFilterDescriptions {
        '='?: string; 
        '<>'?: string;
        '<'?: string;
        '<='?: string;
        '>'?: string;
        '>='?: string;
        'startswith'?: string;
        'contains'?: string;
        'notcontains'?: string;
        'endswith'?: string;
    }
    export interface dxDataGridColumn {
        allowSorting?: boolean;
        allowFiltering?: boolean;
        allowHiding?: boolean;
        allowEditing?: boolean;
        allowGrouping?: boolean;
        allowReordering?: boolean;
        allowResizing?: boolean;
        visible?: boolean;
        dataField?: string;
        dataType?: string;
        calculateCellValue?: (rowData: {}) => any;
        calculateFilterExpression?: (filterValue: any, selectedFilterOperation: string) => Array<any>;
        caption?: string;
        width?: any;         cssClass?: string;
        trueText?: string;
        falseText?: string;
        sortOrder?: string;
        sortIndex?: number;
        groupIndex?: number;
        alignment?: string;
        format?: string;
        precision?: number;
        customizeText?: (options: { value: any; valueText: string }) => string;
        filterOperations?: dxDataGridFilterDescriptions;
        selectedFilterOperation?: string;
        cellTemplate?: any;         headerCellTemplate?: any;         editCellTemplate?: any;         groupCellTemplate?: any;         lookup?: {
            dataSource?: any;             valueExpr?: any;             displayExpr?: any;         };
    }
    export interface dxDataGridOptions extends ui.WidgetOptions {
        dataSource?: any;
        dataErrorOccurred?: (errorObject: {}) => void;
        showColumnHeaders?: boolean;
        columnAutoWidth?: boolean;
        noDataText?: string;
        wordWrapEnabled?: boolean;
        showColumnLines?: boolean;
        showRowLines?: boolean;
        rowAlternationEnabled?: boolean;
        allowColumnReordering?: boolean;
        allowColumnResizing?: boolean;
        hoverStateEnabled?: boolean;
        selectedItems?: Array<any>;
        columnChooser?: {
            enabled?: boolean;
            width?: number;
            height?: number;
            title?: string;
            emptyPanelText?: string;
        };
        selection?: {
            mode?: string;
            allowSelectAll?: boolean;
        };
        sorting?: {
            mode?: string;
            ascendingText?: string;
            descendingText?: string;
            clearText?: string;
        };
        searchPanel?: {
            visible?: boolean;
            width?: number;
            placeholder?: string;
            highlightSearchText?: boolean;
        };
        grouping?: {
            autoExpandAll?: boolean;
            allowCollapsing?: boolean;
            groupContinuesMessage?: string;
            groupContinuedMessage?: string;
        };
        groupPanel?: {
            visible?: boolean;
            emptyPanelText?: string;
            allowColumnDragging?: boolean;
        };
        filterRow?: {
            visible?: boolean;
            showOperationChooser?: boolean;
            showAllText?: string;
            resetOperationText?: string;
            operationDescriptions?: dxDataGridFilterDescriptions;
        };
        paging?: {
            enabled?: boolean;
            pageSize?: number;
            pageIndex?: number;
        };
        pager?: {
            visible?: any;             showPageSizeSelector?: boolean;
            allowedPageSizes?: Array<number>;
        };
        editing?: {
            editMode?: string;
            insertEnabled?: boolean;
            editEnabled?: boolean;
            removeEnabled?: boolean;
            texts?: {
                editRow?: string;
                saveRowChanges?: string;
                cancelRowChanges?: string;
                deleteRow?: string;
                recoverRow?: string;
                undeleteRow?: string;
                confirmDeleteMessage?: string;
                confirmDeleteTitle?: string;
            }
        };
        scrolling?: {
            mode?: string;
            preloadEnabled?: boolean;
            useNativeScrolling?: boolean;
        };
        loadPanel?: {
            enabled?: boolean;
            text?: string;
            width?: number;
            height?: number;
        };
        stateStoring?: {
            enabled?: boolean;
            storageKey?: string;
            type?: string;
            customLoad?: () => any;
            customSave?: (state: {}) => void;
        };
        rowTemplate?: any;         columns?: Array<dxDataGridColumn>;
        selectionChanged?: (options: {}) => void;
        customizeColumns?: (columns: Array<dxDataGridColumn>) => void;
        rowClick?: (data: {}) => void;
        cellClick?: (clickedCell: {}) => void;
        cellHoverChanged?: (hoveredCell: {}) => void;
    }
    export class dxDataGrid extends Widget {
        constructor(element: Element, options?: dxDataGridOptions);
        constructor(element: JQuery, options?: dxDataGridOptions);
        showColumnChooser: () => void;
        hideColumnChooser: () => void;
        beginCustomLoading: (messageText?: string) => void;
        endCustomLoading: () => void;
        startSelectionWithCheckboxes: () => void;
        stopSelectionWithCheckboxes: () => void;
        selectAll: () => void;
        clearSelection: () => void;
        getSelectedRowKeys: () => Array<any>;
        getSelectedRowsData: () => Array<any>;
        selectRows: (keys: Array<any>) => void;
        selectRowsByIndexes: (indexes: Array<any>) => void;
        searchByText: (text: string) => void;
        insertRow: () => void;
        editRow: (rowIndex: number) => void;
        editCell: (rowIndex: number, columnIndex: number) => void;
        removeRow: (rowIndex: number) => void;
        saveEditData: () => void;
        undeleteRow: (rowIndex: number) => void;
        cancelEditData: () => void;
        refresh: () => void;
        filter: (expr: any) => void;
        clearFilter: () => void;
        keyOf: (data: {}) => any;
        byKey: (key: any) => {};
        getDataByKeys: (rowKeys: Array<any>) => Array<{}>;
        pageIndex: (value: number) => number;
        totalCount: () => number;
        closeEditCell: () => void;
        collapseAll: (groupIndex?: number) => void;
        expandAll: (groupIndex?: number) => void;
        addColumn: (options: any) => void;
        columnOption: (columnIndex: number, optionName?: string, optionValue?: any) => {};
        isScrollbarVisible: () => boolean;
        getTopVisibleRowData: () => {};
    }
export interface dxMenuOptions extends CollectionContainerWidgetOptions {
		orientation?: string;
		submenuDirection?: string;
		showFirstSubmenuMode?: string;
		enableHotTrack?: boolean;
		allowSelection?: boolean;
		allowSelectOnClick?: boolean;
		selectedItem?: any;
		itemSelectAction?: any;
		cssClass?: string;
    }
    export interface dxContextMenuOptions extends CollectionContainerWidgetOptions {
		showSubmenuMode?: string;
        invokeOnlyFromCode?: boolean;
		cssClass?: string;
		enableHotTrack?: boolean;
		allowSelection?: boolean;
		allowSelectOnClick?: boolean;
		selectedItem?: any;
		itemSelectAction?: any;
		animation?: any;
		position?: any;
		showingAction?: any;
        submenuDirection?: string;
    }
    export class dxMenu extends CollectionContainerWidget {
        constructor(element: Element, options?: dxMenuOptions);
        constructor(element: JQuery, options?: dxMenuOptions);
    }
	export class dxContextMenu extends CollectionContainerWidget {
        constructor(element: Element, options?: dxContextMenuOptions);
        constructor(element: JQuery, options?: dxContextMenuOptions);
    }
export interface dxColorPickerOptions extends dxDropDownEditorOptions {
        editAlphaChannel?: boolean;
        applyButtonText?: string;
        cancelButtonText?: string;
    }
    export class dxColorPicker extends dxDropDownEditor {
        constructor(element: Element, options?: dxColorPickerOptions);
        constructor(element: JQuery, options?: dxColorPickerOptions);
    }
}
declare module DevExpress.viz {
export class Chart extends Component {
        constructor(element: Element, options?: viz.charts.ChartOptions);
        constructor(element: JQuery, options?: viz.charts.ChartOptions);
        clearSelection(): void;
        getSeries(): viz.charts.series.Series;
        hidiTooltip(): void;
        render(options: viz.charts.RenderOptions): void;
        render(): void;
        zoomArgument(minArg: any, maxArg: any): void;
        getSeriesByPos(seriesIndex: number): viz.charts.series.Series;
        getSeriesByName(seriesName: string): viz.charts.series.Series;
        getAllSeries(): Array<viz.charts.series.Series>;
        instance(): Chart;
        showLoadingIndicator(): void;
        hideLoadingIndicator(): void;
        svg(): string;
        getSize(): { width: number; height: number };
    }
    export class PieChart extends Component {
        constructor(element: Element, options?: viz.charts.PieOptions);
        constructor(element: JQuery, options?: viz.charts.PieOptions);
        clearSelection(): void;
        getSeries(): viz.charts.series.PieSeries;
        hidiTooltip(): void;
        render(options: viz.charts.RenderOptions): void;
        render(): void;
        instance(): PieChart;
        showLoadingIndicator(): void;
        hideLoadingIndicator(): void;
        svg(): string;
        getSize(): { width: number; height: number };
    }
    export class RangeSelector extends Component {
        constructor(element: Element, options?: viz.rangeSelector.RangeSelectorOptions);
        constructor(element: JQuery, options?: viz.rangeSelector.RangeSelectorOptions);
        getSelectedRange: () => viz.rangeSelector.SelectedRange;
        setSelectedRange: (selectedRange: viz.rangeSelector.SelectedRange) => void;
		render(): RangeSelector;
        instance(): RangeSelector;
        showLoadingIndicator(): void;
        hideLoadingIndicator(): void;
        svg(): string;
    }
    export class CircularGauge extends Component {
        constructor(element: Element, options?: viz.gauges.CircularGaugeOptions);
        constructor(element: JQuery, options?: viz.gauges.CircularGaugeOptions);
        value(): number;
        value(val: number): CircularGauge;
        subvalues(): Array<number>;
        subvalues(values: Array<number>): CircularGauge;
        render(): CircularGauge;
        instance(): CircularGauge;
        showLoadingIndicator(): void;
        hideLoadingIndicator(): void;
        svg(): string;
    }
    export class LinearGauge extends Component {
        constructor(element: Element, options?: viz.gauges.LinearGaugeOptions);
        constructor(element: JQuery, options?: viz.gauges.LinearGaugeOptions);
        value(): number;
        value(val: number): LinearGauge;
        subvalues(): Array<number>;
        subvalues(values: Array<number>): LinearGauge;
        render(): LinearGauge;
        instance(): LinearGauge;
        showLoadingIndicator(): void;
        hideLoadingIndicator(): void;
        svg(): string;
    }
    export class BarGauge extends Component {
        constructor(element: Element, options?: viz.gauges.BarGaugeOptions);
        constructor(element: JQuery, options?: viz.gauges.BarGaugeOptions);
        values(): Array<number>;
        values(vals: Array<number>): BarGauge;
        render(): BarGauge;
        instance(): BarGauge;
        showLoadingIndicator(): void;
        hideLoadingIndicator(): void;
        svg(): string;
    }
    export class Sparkline extends Component {
        constructor(element: Element, options?: viz.sparklines.SparklineOptions);
        constructor(element: JQuery, options?: viz.sparklines.SparklineOptions);
        render(): Sparkline;
        instance(): Sparkline;
        svg(): string;
    }
    export class Bullet extends Component {
        constructor(element: Element, options?: viz.sparklines.BulletOptions);
        constructor(element: JQuery, options?: viz.sparklines.BulletOptions);
        render(): Bullet;
        instance(): Bullet;
        svg(): string;
    }
    export class Map extends Component {
        constructor(element: Element, options?: viz.map.VectorMapOptions);
        constructor(element: JQuery, options?: viz.map.VectorMapOptions);
        render(): Map;
        instance(): Map;
        getAreas(): Array<viz.map.AreaProxy>;
        getMarkers(): Array<viz.map.MarkerProxy>;
        clearAreaSelection(): Map;
        clearMarkerSelection(): Map;
        clearSelection(): Map;
        showLoadingIndicator(): void;
        hideLoadingIndicator(): void;
        svg(): string;
        center(): Array<number>;
        center(center: Array<number>): Map;
        zoomFactor(): number;
        zoomFactor(zoomFactor: number): Map;
        viewport(): Array<number>;
        viewport(viewport: Array<number>): Map;
        convertCoordinates(x: number, y: number): Array<number>;
    }
}
declare module DevExpress.viz.charts {
interface z_BaseLegendOptions {
        backgroundColor?: string;
        hoverMode?: string;
        customizeText?: (arg: {
            seriesName: string;
            seriesNumber: number;
            seriesColor: string;
        }) => string;
        verticalAlignment?: string;
        horizontalAlignment?: string;
        itemTextPosition?: string;
        equalColumnWidth?: boolean;
        font?: viz.common.FontOptions;
        visible?: boolean;
        margin?: any;
        markerSize?: number;
        border?: {
            visible?: boolean;
            width?: number;
            color?: string;
            cornerRadius?: number;
            opacity?: number;
            dashStyle?: string;
        };
        paddingLeftRight?: number;
        paddingTopBottom?: number;
        columnsCount?: number;
        rowsCount?: number;
        columnItemSpacing?: number;
        rowItemSpacing?: number;
        orientation?: string;
    }
    interface z_BaseTooltipCustomizeArgument {
        value?: any;
        valueText: string;
        originalValue: string;
        argument: any;
        argumentText: string;
        originalArgument: any;
        percent?: any;
        percentText?: string;
        seriesName: string;
    }
    interface z_BaseTooltipOptions extends common.BaseTooltipOptions {
        customizeText?: (arg: z_BaseTooltipCustomizeArgument) => string;
        customizeTooltip?: (arg: z_BaseTooltipCustomizeArgument) => common.CustomizeTooltipResult;
        format?: string;
        argumentFormat?: string;
        precision?: number;
        argumentPrecision?: number;
        percentPrecision?: number;
    }
    interface z_ChartTooltipCustomizeArgument extends z_BaseTooltipCustomizeArgument{
        closeValueText?: string;
        highValueText?: string;
        lowValueText?: string;
        openValueText?: string;
        originalCloseValue?: any;
        originalHighValue?: any;
        originalLowValue?: any;
        originalOpenValue?: any;
        closeValue?: any;
        highValue?: any;
        lowValue?: any;
        openValue?: any;
        reductionValue?: any;
        reductionValueText?: string;
        originalMinValue?: any;
        rangeValue1?: any;
        rangeValue1Text?: string;
        rangeValue2?: any;
        rangeValue2Text?: string;
        point: series.Point;
    }
    interface z_ChartTooltipOptions extends z_BaseTooltipOptions {
        customizeText?: (arg: z_ChartTooltipCustomizeArgument) => string;
        customizeTooltip?: (arg: z_ChartTooltipCustomizeArgument) => common.CustomizeTooltipResult;
        shared?: boolean;
    }
    interface z_BaseChartOptions extends ComponentOptions {
        incidentOccured?: () => void;
        done?: () => void;
        tooltipShown?: () => void;
        tooltipHidden?: () => void;
        pointSelectionMode?: string;
        redrawOnResize?: boolean;
        tooltip?: z_BaseTooltipOptions;
        loadingIndicator?: common.LoadingIndicatorOptions;
        margin?: {
            left?: number;
            top?: number;
            right?: number;
            bottom?: number;
        };
        size?: {
            width?: number;
            height?: number;
        };
        title?: {
            horizontalAlignment?: string;
            verticalAlignment?: string;
            font?: viz.common.FontOptions;
            text?: string;
            placeholderSize?: number;
            margin?: any; 
        };
        dataSource?: any;
        palette?: any;                                      legend?: z_BaseLegendOptions;
        theme?: string;
        animation?: {
            enabled?: boolean;
            duration?: number;
            easing?: string;
            maxPointCountSupported?: number;
            asyncSeriesRendering?: boolean;
            asyncTrackersRendering?: boolean;
            trackerRenderingDelay?: number;
        };
		pathModified?: boolean;
    }
    export interface CommonPaneSettings {
        backgroundColor?: string;
        border?: {
            color?: string;
            bottom?: boolean;
            left?: boolean;
            right?: boolean;
            top?: boolean;
            dashStyle?: string;
            visible?: boolean;
            width?: number;
            opacity?: number;
        };
    }
    export interface PaneSettings extends CommonPaneSettings {
        name: string;
    }
    export interface ChartLegendOptions extends z_BaseLegendOptions {
        hoverMode?: string;
        position?: string;
    }
    interface z_CommonAxisLabelSettings {
        alignment?: string;
        font?: viz.common.FontOptions;
        indentFromAxis?: number;
        overlappingBehavior?: {
            mode?: string;
            rotationAngle?: number;
            staggeringSpacing?: number;
        };
        rotationAngle?: number;
        staggered?: boolean;
        staggeringSpacing?: number;
    }
    interface z_BaseConstantLineLabel {
        visible?: boolean;
        position?: string;
        font?: viz.common.FontOptions; 
    }
    interface ConstantLineAxisLabel extends z_BaseConstantLineLabel {
        horizontalAlignment?: string;
        verticalAlignment?: string;
    }
    export interface ConstantLineLabel extends ConstantLineAxisLabel {
        text?: string;
    }
    export interface CommonConstantLineStyle {
        paddingLeftRight?: number;
        paddingTopBottom?: number;
        width?: number;
        dashStyle?: string;
        color?: string;
        label?: z_BaseConstantLineLabel;
    }
    export interface ConstantLineOptions extends CommonConstantLineStyle{
        value?: any;
        label?: ConstantLineLabel;
    }
    interface z_AxisConstantLineStyle extends CommonConstantLineStyle {
        label?: ConstantLineAxisLabel;
    }
    interface z_StripStyle {
        label?: {
            font?: viz.common.FontOptions;
            horizontalAlignment?: string;
            verticalAlignment?: string;
        };
        paddingLeftRight?: number;
        paddingTopBottom?: number;
    }
    export interface CommonAxisSettings {
        color?: string;
        discreteAxisDivisionMode?: string;
        grid?: {
            color?: string;
            opacity?: string;
            visible?: boolean;
            width?: number;
        }
        inverted?: boolean;
        label?: z_CommonAxisLabelSettings;
        maxValueMargin?: number;
        minValueMargin?: number;
        opacity?: number;
        placeholderSize?: number;
        setTicksAtUnitBeginning?: boolean;
        stripStyle?: z_StripStyle
        constantLineStyle?: CommonConstantLineStyle;
        tick?: {
            color?: string;
            opacity?: number;
            visible?: boolean;
        };
        title?: {
            font?: viz.common.FontOptions;
            margin?: number;
            text?: string;
        };
        valueMarginsEnabled?: boolean;
        visible?: boolean;
        width?: number;
    }
    export interface StripOptions  extends z_StripStyle{
        color?: string;
        endValue: any;
        startValue: any;
        label?: {
            font?: viz.common.FontOptions;
            horizontalAlignment?: string;
            verticalAlignment?: string;
            text?: string;
        };
    }
    interface z_AxisLabelSettings extends z_CommonAxisLabelSettings{
        customizeText: (arg: {
            value: any;
            valueText: string;
        }) => string;
    }
    export interface ArgumentAxisOptions extends CommonAxisSettings {
        argumentType?: string;
        axisDivisionFactor?: number;
        categories?: Array<string>;         
        hoverMode?: string;
        label?: z_AxisLabelSettings;
        max?: number;
        min?: number;
        tickInterval?: any;                    
        position?: string;
        constantLineStyle?: z_AxisConstantLineStyle;
        strips?: Array<StripOptions>;
        constantLines?: Array<ConstantLineOptions>;
        type?: string;
    }
    export interface ValueAxisOptions extends CommonAxisSettings {
        valueType?: string;
        axisDivisionFactor?: number;
        categories?: Array<any>;           
        hoverMode?: string;
        max?: number;
        min?: number;
        tickInterval?: any;                             position?: string;
        strips?: Array<StripOptions>;
        constantLines?: Array<ConstantLineOptions>;
        constantLineStyle?: z_AxisConstantLineStyle;
        type?: string;
        name?: string;
        label?: z_AxisLabelSettings;
    }
    interface z_CrosshairLine {
        color?: string;
        width?: number;
        dashStyle?: string;
        opacity?: number;
    }
    interface z_CrosshairOptions extends z_CrosshairLine {
        enabled?: boolean;
        verticalLine?: z_CrosshairLine;
        horizontalLine?: z_CrosshairLine;
    }
    export interface ChartOptions extends z_BaseChartOptions {
        needAggregate?: boolean;
        defaultPane?: string;
        adjustOnZoom?: boolean;
        rotated?: boolean;
        synchronizeMultiAxes?: boolean;
        equalBarWidth?: {
            spacing?: number;
            width?: number;
        };
        adaptiveLayout?: {
            width?: number;
            height?: number;
            keepLabels?: boolean;
        };
        customizePoint?: (arg: {
            index: number;
            argument: any;
            seriesName: string;
            tag: any;
            value?: any;
            rangeValue1?: any;
            rangeValue2?: any;
        }) => series.BasePointOptions;
		customizeLabel?: (arg: {
			index: number;
			argument: any;
			seriesName: string;
			tag: any;
			value?: any;
			ramgeValue1?: any;
			rangeValue2?: any;
		}) => series.z_BaseLabelOptions;
        commonPaneSettings?: CommonPaneSettings;
        panes?: Array<PaneSettings>;
        containerBackgroundColor?: string;
        seriesTemplate?: {
            nameField?: string;
            customizeSeries?: (valueFromNameField: string) => viz.charts.series.SeriesOptions;
        };
        crosshair?: z_CrosshairOptions;
        seriesSelectionMode?: string;
        tooltip?: z_ChartTooltipOptions;
        dataPrepareSettings?: {
            checkTypeForAllData?: boolean;
            convertToAxisDataType?: boolean;
            sortingMethod?: any;             
        };
        useAggregation?: boolean;
        argumentAxisClick?: (axis: any, argument: any, event: JQueryMouseEventObject) => void;         
        legend?: ChartLegendOptions;
        argumentAxis?: ArgumentAxisOptions;
        valueAxis?: Array<ValueAxisOptions>;
        commonAxisSettings?: CommonAxisSettings;
        series?: Array<viz.charts.series.SeriesOptions>;
        commonSeriesSettings?: viz.charts.series.commonSeriesSettings;
        seriesClick?: (series: viz.charts.series.Series, event: JQueryMouseEventObject) => void;
        seriesHover?: (series: viz.charts.series.Series) => void;
        seriesSelected?: (series: viz.charts.series.Series) => void;
        seriesHoverChanged?: (series: viz.charts.series.Series) => void;
        pointClick?: (point: viz.charts.series.Point, event: JQueryMouseEventObject) => void;
        legendClick?: (obj: any, event: JQueryMouseEventObject) => void;                                    pointHover?: (point: viz.charts.series.Point) => void;
        pointSelected?: (point: viz.charts.series.Point) => void;
        seriesSelectionChanged?: (series: viz.charts.series.Series) => void;
        pointSelectionChanged?: (point: viz.charts.series.Point) => void;
        pointHoverChanged?: (point: viz.charts.series.Point) => void;
		drawn?: (arg:viz.Chart) => void;
		minBubbleSize?: number;
		maxBubbleSize?: number;
    }
    export interface PieOptions extends z_BaseChartOptions {
        pointClick?: (point: viz.charts.series.PiePoint, event: JQueryMouseEventObject) => void;
        legendClick?: (point: viz.charts.series.PiePoint, event: JQueryMouseEventObject) => void;
        pointHover?: (point: viz.charts.series.PiePoint) => void;
        pointSelected?: (point: viz.charts.series.PiePoint) => void;
        pointSelectionChanged?: (point: viz.charts.series.PiePoint) => void;
        pointHoverChanged?: (point: viz.charts.series.PiePoint) => void;
        series?: viz.charts.series.PieSeriesOptions;
		drawn?: (arg:viz.PieChart) => void;
    }
    export interface RenderOptions {
        force?: boolean;
        animate?: boolean;
        asyncSeriesRendering?: boolean;
    }
}
declare module DevExpress.viz.charts.series {
export interface z_BasePointStyle {
        color?: string;
        border?: {
            visible?: boolean;
            width?: number;
            color?: string;
        };
        size?: number;
    }
    interface BasePointOptions extends z_BasePointStyle {
        hoverMode?: string;
        selectionMode?: string;
        visible?: boolean;
        symbol?: string;
        image?: any;
        hoverStyle?: z_BasePointStyle;
        selectionStyle?: z_BasePointStyle;
    }
    interface z_BaseSeriesOptions {
        argumentField?: string;
        hoverMode?: string;
        maxLabelCount?: number;
        label?: z_BaseLabelOptions;
        selectionMode?: string;
        showInLegend?: boolean;
        tagField?: string;
        visible?: boolean;
    }
    interface z_BaseLabelOptions {
        visible?: boolean;
        alignment?: string;
        rotationAngle?: number;
        format?: string;
        precision?: number;
        argumentFormat?: string;
        argumentPrecision?: number;
        precission?: number;
        percentPrecision?: number;
        font?: viz.common.FontOptions;
        backgroundColor?: string;
        border?: {
            visible?: boolean;
            width?: number;
            color?: string;
            dashStyle?: string;
        };
        connector?: {
            visible?: boolean;
            width?: number;
            color?: string;
        }
    }
    interface z_BaseChartSeriesLabelOptions extends z_BaseLabelOptions {
        horizontalOffset?: number;
        verticalOffset?: number;
        customizeText?: (arg: {
            originalValue: any;
            value: any;
            valueText: string;
            originalArgument: any;
            argument: any;
            argumentText: string;
            seriesName: string;
        }) => string;
    }
    interface z_BaseSeriesStyle {
        color?: string;
    }
    export interface ScatterSeriesOptions extends z_BaseSeriesOptions, z_BaseSeriesStyle {
        selectionStyle?: z_BaseSeriesStyle;
        hoverStyle?: z_BaseSeriesStyle;
        valueField?: string;
        point?: BasePointOptions;
        axis?: string;
        pane?: string;
    }
    export interface LineSeriesStyle extends z_BaseSeriesStyle {
        dashStyle?: string;
        width?: number;
    }
    export interface LineSeriesOptions extends LineSeriesStyle, z_BaseSeriesOptions {
        selectionStyle?: LineSeriesStyle;
        hoverStyle?: LineSeriesStyle;
        valueField?: string;
        point?: BasePointOptions;
        pane?: string;
    }
    export interface AreaSeriesStyle extends z_BaseSeriesStyle {
        hatching?: {
            direction?: string;
            width?: number;
            step?: number;
            opacity?: number
        };
        border?: {
            visible?: boolean;
            width?: number;
            color?: string;
            dashStyle?: string;
        };
    }
    export interface AreaSeriesOptions extends AreaSeriesStyle, z_BaseSeriesOptions {
        selectionStyle?: AreaSeriesStyle;
        hoverStyle?: AreaSeriesStyle;
        valueField?: string;
        point?: BasePointOptions;
        pane?: string;
        axis?: string;
    }
    export interface BarSeriesLabel extends z_BaseChartSeriesLabelOptions {
        position?: string;
        showForZeroValues?: boolean;
    }
    export interface BarSeriesStyle extends AreaSeriesStyle { }
    interface z_BaseBarSeriesOptions extends z_BaseSeriesOptions, BarSeriesStyle {
        minBarSize?: number;
        cornerRadius?: number;
        label?: BarSeriesLabel;
        selectionStyle?: BarSeriesStyle;
        hoverStyle?: BarSeriesStyle;
        pane?: string;
        axis?: string;
    }
    export interface BarSeriesOptions extends z_BaseBarSeriesOptions {
        valueField?: string;
    }
    export interface OHLCSeriesStyle extends z_BaseSeriesStyle{
        width?: number;
    }
    interface z_BaseOHLCSeries extends z_BaseSeriesOptions{
        openValueField?: string;
        highValueField?: string;
        lowValueField?: string;
        closeValueField?: string;
        reduction?: {
            color?: string;
            level?: string;
        };
        pane?: string;
        axis?: string;
    }
    export interface CandleStickSeriesOptions extends z_BaseOHLCSeries, OHLCSeriesStyle {
        innerColor?: string;
        selectionStyle?: OHLCSeriesStyle;
        hoverStyle?: OHLCSeriesStyle;
    }
    export interface StockSeriesOptions extends z_BaseOHLCSeries, OHLCSeriesStyle {
        selectionStyle?: OHLCSeriesStyle;
        hoverStyle?: OHLCSeriesStyle;
    }
    export interface FullStackedAreaSeriesOptions extends z_BaseSeriesOptions, AreaSeriesOptions {
        valueField?: string;
        selectionStyle?: AreaSeriesStyle;
        hoverStyle?: AreaSeriesStyle;
        point?: BasePointOptions;
    }
    export interface FullStackedBarSeriesOptions extends BarSeriesOptions {
        stack?: string;
    }
    export interface FullStackedLineSeriesOptions extends LineSeriesOptions{
        point?: BasePointOptions;
    }
    interface z_BaseRangeSeriesOptions extends z_BaseSeriesOptions {
        rangeValue1Field?: string;
        rangeValue2Field?: string;
        pane?: string;
        axis?: string;
    }
    export interface RangeAreaSeriesOptions extends z_BaseSeriesOptions, AreaSeriesStyle {
        selectionStyle?: AreaSeriesStyle;
        hoverStyle?: AreaSeriesStyle;
        point?: BasePointOptions;
    }
    export interface RangeBarSeriesOptions extends z_BaseBarSeriesOptions {
        rangeValue1Field?: string;
        rangeValue2Field?: string;
        pane?: string;
        axis?: string;
    }
    export interface SplineSeriesOptions extends LineSeriesOptions {}
    export interface SplineAreaSeries extends AreaSeriesOptions { }
    export interface StackedLineSeries extends LineSeriesOptions { }
    export interface StackedAreaSeries extends AreaSeriesOptions { }
    export interface StackedBasrSeriesOptions extends BarSeriesOptions {
        stack?: string;
    }
    export interface BubbleSeriesStyle extends AreaSeriesStyle { }
    export interface BubbleSeriesOptions extends z_BaseBarSeriesOptions, BubbleSeriesStyle {
        selectionStyle?: LineSeriesStyle;
        hoverStyle?: LineSeriesStyle;
        valueField?: string;
        pane?: string;
        sizeField?: string;
    }
    export interface StepLineSeries extends LineSeriesOptions { }
    export interface StepAreaSeries extends AreaSeriesOptions { }
    export interface PieSeriesStyle extends AreaSeriesStyle { }
    interface PieSeriesLabelOptions extends z_BaseLabelOptions {
        customizeText: (arg: {
            value: any;
            valueText: string;
            originalValue: any;
            argument: any;
            argumentText: string;
            originalArgument: any;
            percent: any;
            percentText: string;
            seriesName: string;
        }) => string;
        radialOffset?: number;
    }
    export interface PieSeriesOptions extends z_BaseSeriesOptions, PieSeriesStyle{
        valueField?: string;
        minSegmentSize?: string;
        selectionStyle?: PieSeriesStyle;
        hoverStyle?: PieSeriesStyle;
        segmentsDirection?: string;
		startAngle?: number;
        type?: string;
        label?: PieSeriesLabelOptions;
		smallValuesGrouping?: valuesGrouping;
    }
	interface valuesGrouping{ 
		mode?: string;
		topCount?: number;
		threshold?: number;
		groupName?: string;
	}
    interface AllSeriesStyleOptions extends z_BaseSeriesStyle, AreaSeriesStyle, LineSeriesStyle { }
    interface z_AllLabelsOptions extends z_BaseChartSeriesLabelOptions, BarSeriesLabel { }
    export interface CommonSeriesOptions extends z_BaseSeriesOptions, z_BaseBarSeriesOptions, z_BaseRangeSeriesOptions, z_BaseOHLCSeries, AllSeriesStyleOptions, BubbleSeriesOptions {
        selectionStyle?: AllSeriesStyleOptions;
        hoverStyle?: AllSeriesStyleOptions;
        label?: z_AllLabelsOptions;
        valueField?: string;
    }
    export interface SeriesOptions extends CommonSeriesOptions {
        tag?: any;
        name?: string;
        type?: string;
    }
    export interface commonSeriesSettings extends CommonSeriesOptions {
        area?: AreaSeriesOptions;
        bar?: BarSeriesOptions;
        candlestick?: CandleStickSeriesOptions;
        fullstackedarea?: FullStackedAreaSeriesOptions;
        fullstackedbar?: FullStackedBarSeriesOptions;
        fullstackedline?: FullStackedLineSeriesOptions;
        line?: LineSeriesOptions;
        rangearea?: RangeAreaSeriesOptions;
        rangebar?: RangeBarSeriesOptions;
        scatter?: ScatterSeriesOptions;
        spline?: SplineSeriesOptions;
        splinearea?: SplineAreaSeries;
        stackedarea?: StackedAreaSeries;
        stackedbar?: StackedBasrSeriesOptions;
        stackedline?: StackedLineSeries;
        steparea?: StepAreaSeries;
        stepline?: StepLineSeries;
        stock?: StockSeriesOptions;
        bubble?: BubbleSeriesOptions;
    }
    class z_BasePoint {
        fullState: number;
        originalArgument: any;
        originalValue: any;
        tag: any;
        clearSelection(): void;
        select(): void;
        hideTootip(): void;
        isSelected(): boolean;
        isHovered(): boolean;
        getColor(): string;
    }
    export class Point extends z_BasePoint{
        series: Series;
    }
    export class PiePoint extends z_BasePoint {
        percent: any;
        series: PieSeries;
        isVisible():boolean;
        hide(): void;
        show(): void;
    }
    export class Series {
        axis: string;
        fullState: number;
        name: string;
        pane: string;
        tag: any;
        type: string;
        clearSelection (): void;
        deselectPoint (point:Point) : void;
        getAllPoints () : Array<Point>
        getPointByArg(pointArg: any): Point;
        getPointByPos(positionIndex: number): Point;
        select () : void;
        selectPoint (point:Point) : void;
        isSelected (): boolean;
        isHovered(): boolean;
        isVisible(): boolean;
        show(): void;
        hode(): void;
    }
    export class PieSeries {
        fullState: number;
        type: string;
        clearSelection(): void;
        deselectPoint(point:PiePoint): void;
        getAllPoints(): Array<PiePoint>
        getPointByArg(pointArg: any): PiePoint;
        getPointByPos(positionIndex: number): PiePoint;
        select(): void;
        selectPoint(point: PiePoint): void;
        isSelected(): boolean;
        isHovered(): boolean;
    }
}
declare module DevExpress.viz.common {
export interface FontOptions {
        color?: string;
        family?: string;
        opacity?: number;
        size?: number;
        weight?: number;
    }
    export interface tickIntervalObject {
        years?: number;
        quarters?: number;
        months?: number;
        days?: number;
        hours?: number;
        minutes?: number;
        seconds?: number;
        milliseconds?: number;
    }
    export interface LoadingIndicatorOptions {
        backgroundColor?: string;
        text?: string;
        font?: FontOptions;
    }
    export interface CustomizeTooltipResult {
        color?: string;
        text?:string;
    }
    export interface BaseTooltipOptions {
        enabled?: boolean;
        color?: string;
        border?: {
            dashStyle?: string;
            color?: string;
            opacity?: number;
            visible?: boolean;
            width?: number;
        };
        font?: FontOptions;
        arrowLength?: number;
        paddingLeftRight?: number;
        paddingTopBottom?: number;
        opacity?: number;
		chadow?: {
			color?: string;
			opacity?: number;
			offsetX?: number;
			offsetY?: number;
			blur?: number;
		}
    }
}
declare module DevExpress.viz.gauges {
interface CustomizeTextArgument {
        value: number;
        valueText: string;
        color: string;
    }
    interface z_textOptions {
        format?: string;
        precision?: number;
        customizeText?: (arg: CustomizeTextArgument) => string;
        font?: viz.common.FontOptions;
    }
    interface z_textOptionsWithIndent extends z_textOptions {
        indent?: number;
    }
    interface z_GaugeTooltipOptions extends common.BaseTooltipOptions {
        format?: string;
        precision?: number;
        customizeText?: (arg: CustomizeTextArgument) => string;
        customizeTooltip?: (arg: CustomizeTextArgument) => common.CustomizeTooltipResult;
    }
    interface z_BaseGaugeOptions  {
        size?: {
            width?: number;
            height?: number;
        };
        margin?: {  
            left?: number;
            right?: number;
            top?: number;
            bottom?: number;
        };
		theme?: string;
        loadingIndicator?: common.LoadingIndicatorOptions;
        containerBackgroundColor?: string;
		animation?: {
            enabled?: boolean;
            duration?: number;
            easing?: string;
		};
        redrawOnResize?: boolean;
        title?: {
            position?: string;
            text?: string;
            font?: viz.common.FontOptions;
        };
        subtitle?: {
            text?: string;
            font?: viz.common.FontOptions;
        };
        tooltip?: z_GaugeTooltipOptions;
        value?: number;
        subvalues?: Array<number>;
		pathModified?: boolean;
    }
    interface z_BaseRangeContainer {
        offset?: number;
        backgroundColor?: string;
        ranges?: Array<{
            startValue?: number;
            endValue?: number;
            color?: string;
        }>
    }
    interface z_BaseScale {
        startValue?: number;
        endValue?: number;
        hideFirstTick?: boolean;
        hideLastTick?: boolean;
        hideFirstLabel?: boolean;
        hideLastLabel?: boolean;
        majorTick?: {
            color?: string;
            length?: number;
            width?: number;
            customTickValues?: Array<number>;
            useTicksAutoArrangement?: boolean;
            tickInterval?: number;
            showCalculatedTicks?: boolean;
            visible?: boolean;
        };
        minorTick?: {
            color?: string;
            length?: number;
            width?: number;
            customTickValues?: Array<number>;
            tickInterval?: number;
            showCalculatedTicks?: boolean;
            visible?: boolean;
        };
        label?: z_textOptions;
    }
    interface z_BaseValueIndicator {
        color?: string;
        baseValue?: number;
        size?: number;
        backgroundColor?: string;
        text?: z_textOptionsWithIndent;
    }
    interface z_BaseSubValueIndicator {
        type?: string;
        length?: number;
        width?: number;
        color?: string;
        arrowLength?: number;
        text?: z_textOptions;
		palette?: Array<number>
    }
    export interface CircularGaugeRangeContainer extends z_BaseRangeContainer {
        width?: number;
        orientation?: string;
    }
    export interface CircularGaugeScale extends z_BaseScale{
      orientation: string;
            label: {
                format?: string;
                precision?: number;
                customizeText?: (arg:CustomizeTextArgument) => string;
                font?: viz.common.FontOptions;
                indentFromTick?: number;
            }
    }
    export interface CircularGaugeValueIndicator extends z_BaseValueIndicator {
        type?: string;
        offset?: number;
        indentFromCenter?: number;
        width?: number;
        secondColor?: string;
        secondFraction?: number;
        spindleSize?: number;
        spindleGapSize?: number;
    }
    export interface CircularGaugeSubValueIndicator extends z_BaseSubValueIndicator {
        offset?: number;
    }
    export interface CircularGaugeOptions extends z_BaseGaugeOptions{
        rangeContainer?: CircularGaugeRangeContainer;
        geometry?: {
            startAngle?: number;
            endAngle?: number;
        };
        scale?: CircularGaugeScale;
        valueIndicator?: CircularGaugeValueIndicator;
        spindle?: {
            visible?: boolean;
            size?: number;
            gapSize?: number;
            color?: string;
        };
		drawn?: (arg:viz.CircularGauge) => void;
    }
    export interface LinearGaugeScale extends z_BaseScale {      
        verticalOrientation?: string;
        horizontalOrientation?: string;
        label?: {
            format?: string;
            precision?: number;
            customizeText?: (arg:CustomizeTextArgument) => string;
            font?: viz.common.FontOptions;
            indentFromTick?: number;
        }
    }
    export interface LinearGaugeRangeContainer extends z_BaseRangeContainer {
        width?: {
            start?: number;
            end?: number;
        };
        verticalOrientation?: string;
        horizontalOrientation?: string;
    }
    export interface LinearGaugeValueIndicator extends z_BaseValueIndicator {
        offset?: number;
        horizontalOrientation?: string;
        verticalOrientation?: string;
        length?: number;
        width?: number;
    }
    export interface LinearGaugeSubValueIndicator extends z_BaseSubValueIndicator {
        offset?: number;
        horizontalOrientation?: string;
        verticalOrientation?: string;
    }
    export interface LinearGaugeOptions extends z_BaseGaugeOptions {
        geometry?: {
            orientation?: string;
        };
        scale?: LinearGaugeScale;
        valueIndicator?: LinearGaugeValueIndicator;
		drawn?: (arg:viz.LinearGauge) => void;
    }
	export interface BarGaugeOptions {
        size?: {
            width?: number;
            height?: number;
        };
		theme?: string;
        loadingIndicator?: common.LoadingIndicatorOptions;
        animationEnabled?: boolean;
        animationDuration?: number;
		animation?: {
            enabled?: boolean;
            duration?: number;
            easing?: string;
		};
        redrawOnResize?: boolean;
        title?: {
            position?: string;
            text?: string;
            font?: viz.common.FontOptions;
        };
		subtitle?: {
            text?: string;
            font?: viz.common.FontOptions;
        };
        tooltip?: z_GaugeTooltipOptions;
		geometry?: {
			startAngle?: number;
			endAngle?: number;
		};
		label?: {
			visible?: boolean;
			indent?: number;
			connectorWidth?: number;
			connectorColor?: string;
			format?: string;
			precision?: number;
			customizeText?: (arg:CustomizeTextArgument) => string;
			font?: viz.common.FontOptions;
		};
		startValue?: number;
		endValue?: number;
		baseValue?: number;
		values?: Array<number>;
		drawn?: (arg:viz.BarGauge) => void;
		pathModified?: boolean;
	}
}
declare module DevExpress.viz.map {
interface TooltipOptions extends common.BaseTooltipOptions {
        customizeText?: (arg: Proxy) => string;
        customizeTooltip?: (arg: Proxy) => common.CustomizeTooltipResult;
        borderColor?: string;
    }
    export interface VectorMapOptions {
        size?: {
            width?: number;
            height?: number;
        };
        theme?: string;
        background?: {
            borderColor?: string;
            color?: string;
        };
        loadingIndicator?: common.LoadingIndicatorOptions;
        mapData?: any;
        areaSettings?: {
            borderColor?: string;
            color?: string;
            hoveredBorderColor?: string;
            hoveredColor?: string;
            selectedBorderColor?: string;
            selectedColor?: string;
            hoverEnabled?: boolean;
            selectionMode?: string;
            palette?: any;
            paletteSize?: number;
            customize?: (arg: any) => AreaOptions;
            click?: (arg: AreaProxy, event: JQueryMouseEventObject) => void;
            selectionChanged?: (arg: AreaProxy) => void;
        };
        markers?: any;
        markerSettings?: {
            size?: number;
            minSize?: number;
            maxSize?: number;
            borderColor?: string;
            color?: string;
            hoveredBorderColor?: string;
            hoveredColor?: string;
            selectedBorderColor?: string;
            selectedColor?: string;
            font?: common.FontOptions;
            hoverEnabled?: boolean;
            selectionMode?: string;
            customize?: (arg: any) => MarkerOptions;
            click?: (arg: MarkerProxy, event: JQueryMouseEventObject) => void;
            selectionChanged?: (arg: MarkerProxy) => void;
        };
        controlBar?: {
            enabled?: boolean;
            borderColor?: string;
            color?: string;
        };
        tooltip?: TooltipOptions;
        bounds?: Array<number>;
        center?: Array<number>;
        zoomFactor?: number;
        click?: (event: JQueryMouseEventObject) => void;
        centerChanged?: (arg: Array<number>) => void;
        zoomFactorChanged?: (arg: number) => void;
        drawn?: (arg: viz.Map) => void;
        pathModified?: boolean;
    }
    export interface AreaOptions {
        borderColor?: string;
        color?: string;
        hoveredBorderColor?: string;
        hoveredColor?: string;
        selectedBorderColor?: string;
        selectedColor?: string;
        paletteIndex?: number;
        isSelected?: boolean;
    }
    export interface MarkerOptions {
        borderColor?: string;
        color?: string;
        hoveredBorderColor?: string;
        hoveredColor?: string;
        selectedBorderColor?: string;
        selectedColor?: string;
        isSelected?: boolean;
    }
    export interface Proxy {
        type: string;
        attribute(name: string): any;
        selected(state: boolean): void;
        selected(): boolean;
    }
    export interface AreaProxy extends Proxy {
    }
    export interface MarkerProxy extends Proxy {
        coordinates(): Array<number>;	
    }
}
declare module DevExpress.viz.rangeSelector {
export interface SelectedRange {
        startValue: any;                        endValue: any;
    }
    interface CustomizeTextArgument {
        value: any;
        valueText: string;
    }
    export interface RangeSelectorOptions {
        background?: {
            color?: string;
            image?: {
                location?: string;
                url?: string;
            }
            visible?: boolean;
        };
        loadingIndicator?: common.LoadingIndicatorOptions;
        behavior?: {
            allowSlidersSwap?: boolean;
            animationEnabled?: boolean;
            callSelectedRangeChanged?: string;
            manualRangeSelectionEnabled?: boolean;
            moveSelectedRangeByClick?: boolean;
            snapToTicks?: boolean;
        };
        chart?: {
            bottomIndent?: number;
            equalBarWidth?: {
                spacing?: number;
                width?: number;
            };
            dataPrepareSettings?: {
                checkTypeForAllData?: boolean;
                convertToAxisDataType?: boolean;
                sortingMethod?: any;                       };
            useAggregation?: boolean;
            series?: Array<viz.charts.series.SeriesOptions>;
            commonSeriesSettings?: viz.charts.series.commonSeriesSettings;
            topIndent?: number;
            valueAxis?: {
                max?: any;                                      min?: any;                                      inverted?: boolean;
                valueType?: string;
				type?: string;
				logarithmBase?: number;
            };
        }
        containerBackgroundColor?: string;
        dataSource?: Array<{}>;                 
        dataSourceField?: string;
        margin?: {
            left?: number;
            top?: number;
            right?: number;
            bottom?: number;
        };
        redrawOnResize?: boolean;
        scale?: {
            startValue?: any;                       endValue?: any;
            label?: {
                customizeText?: (arg: CustomizeTextArgument) => string;
                font?: viz.common.FontOptions;
                format?: string;
                precision?: number;
                topIndent?: number;
                visible?: boolean;
            };
            majorTickInterval?: any;             marker?: {
                label?: {
                    customizeText?: (arg: CustomizeTextArgument) => string;
                    format?: string;
                };
                separatorHeight?: number;
                textLeftIndent?: number;
                textTopIndent?: number;
                topIndent?: number;
                visible?: boolean;
            };
            maxRange?: any;                             minorTickCount?: number;
            placeHolderHeight?: number;
            setTicksAtUnitBeginning?: boolean;
            showCustomBoundaryTicks?: boolean;
            showMinorTicks?: boolean;
            tick?: {
                color?: string;
                opacity?: number;
                width?: number;
            };
            minorTickInterval?: any;                useTicksAutoArrangement?: boolean;
            valueType?: string;
			type?: string;
			logarithmBase?: number;
        }
        selectedRange?: SelectedRange;
        selectedRangeChaged?: (startValue: any, endValue: any) => void;
        shutter?: {
            color?: string;
            opacity?: string;
        }
        size?: {
            width?: number;
            height?: number;
        };
        sliderHandle?: {
            color?: string;
            opacity?: number;
            width?: string;
        };
        sliderMarker?: {
            color?: string;
            customizeText?: (arg: CustomizeTextArgument) => string;
            font?: viz.common.FontOptions;
            format?: string;
            invalidRangeColor?: string;
            padding?: number;
            placeHolderSize?: {
                height?: number;
                width?: {
                    left?: number;
                    right?: number;
                }
                precission?: number;
                visible?: boolean;
            }
        };
        theme?: string;
		drawn?: (arg:viz.RangeSelector) => void;
		pathModified?: boolean;
    }
}
declare module DevExpress.viz.sparklines {
interface z_SparklineTooltipFormatObject {
        firstValue?: string;
        lastValue?: string;
        maxValue?: string;
        minValue?: string;
        originalFirstValue?: any;
        originalLastValue?: any;
        originalMaxValue?: any;
        originalMinValue?: any;
    }
    interface SparklineTooltipOptions extends common.BaseTooltipOptions {
        customizeText?: (arg: z_SparklineTooltipFormatObject) => string;
        customizeTooltip?: (arg: z_SparklineTooltipFormatObject) => common.CustomizeTooltipResult;
        allowContainerResizing?: boolean;
        horizontalAlignment?: string;
        verticalAlignment?: string;
        format?: string;
        precision?: number;
    }
    interface z_BaseSparklineSettings {
        theme?: string;
        size?: {
            width?: number;
            height?: number;
        };
        tooltip?: SparklineTooltipOptions;
		pathModified?: boolean;
    }
    interface SparklineOptions extends z_BaseSparklineSettings {
        dataSource?: Array<any>;
        argumentField?: string;
        valueField?: string;
        type?: string;
        lineColor?: string;
        lineWidth?: number;
        showFirstLast?: boolean;
        showMinMax?: boolean;
        minColor?: string;
        maxColor?: string;
        firstLastColor?: string;
        barPositiveColor?: string;
        barNegativeColor?: string;
        winColor?: string;
        lossColor?: string;
        pointSymbol?: string;
        pointSize?: number;
        pointColor?: string;
        winlossThreshold?: number;
		drawn?: (arg:viz.Sparkline) => void;
		ignoreEmptyPoints?: boolean;
    }
    interface z_BulletTooltipFormatObject {
        originalValue?: any;
        originalTarget?: any;
        value?: string;
        target?: string;
    }
    interface BulletTooltipOptions extends SparklineTooltipOptions {
        customizeText?: (arg: z_BulletTooltipFormatObject) => string;
        customizeTooltip?: (arg: z_BulletTooltipFormatObject) => common.CustomizeTooltipResult;
    }
    interface BulletOptions extends z_BaseSparklineSettings{
        value?: number;
        target?: number;
        endScaleValue?: number;
        color?: string;
        targetColor?: string;
        targetWidth?: number;
        targetVisible?: boolean;
        tooltip?: BulletTooltipOptions;
		drawn?: (arg:viz.Bullet) => void;
    }
}
interface JQuery {
dxAutocomplete(options?: DevExpress.ui.dxAutocompleteOptions): JQuery;
dxButton(options?: DevExpress.ui.dxButtonOptions): JQuery;
dxCheckBox(options?: DevExpress.ui.dxCheckBoxOptions): JQuery;
dxCalendar(options?: DevExpress.ui.dxCalendarOptions): JQuery;
dxDateBox(options?: DevExpress.ui.dxDateBoxOptions): JQuery;
dxTextEditor(options?: DevExpress.ui.dxTextEditorOptions): JQuery;
dxList(options?: DevExpress.ui.dxListOptions): JQuery;
dxLoadPanel(options?: DevExpress.ui.dxLoadPanelOptions): JQuery;
dxLookup(options?: DevExpress.ui.dxLookupOptions): JQuery;
dxMap(options?: DevExpress.ui.dxMapOptions): JQuery;
dxNavBar(options?: DevExpress.ui.dxNavBarOptions): JQuery;
dxNumberBox(options?: DevExpress.ui.dxNumberBoxOptions): JQuery;
dxOverlay(options?: DevExpress.ui.dxOverlayOptions): JQuery;
dxPopup(options?: DevExpress.ui.dxPopupOptions): JQuery;
dxPopover(options?: DevExpress.ui.dxPopoverOptions): JQuery;
dxTooltip(options?: DevExpress.ui.dxTooltipOptions): JQuery;
dxRadioGroup(options?: DevExpress.ui.dxRadioGroupOptions): JQuery;
dxRangeSlider(options?: DevExpress.ui.dxRangeSliderOptions): JQuery;
dxScrollable(options?: DevExpress.ui.dxScrollableOptions): JQuery;
dxScrollView(options?: DevExpress.ui.dxScrollViewOptions): JQuery;
dxSelectBox(options?: DevExpress.ui.dxSelectBoxOptions): JQuery;
dxSlider(options?: DevExpress.ui.dxSliderOptions): JQuery;
dxTabs(options?: DevExpress.ui.dxTabsOptions): JQuery;
dxTextArea(options?: DevExpress.ui.dxTextAreaOptions): JQuery;
dxTextBox(options?: DevExpress.ui.dxTextBoxOptions): JQuery;
dxToast(options?: DevExpress.ui.dxToastOptions): JQuery;
dxToolbar(options?: DevExpress.ui.dxToolbarOptions): JQuery;
dxDropDownEditor(options?: DevExpress.ui.dxDropDownEditorOptions): JQuery;
dxLoadIndicator(options?: DevExpress.ui.dxLoadIndicatorOptions): JQuery;
dxMultiView(options?: DevExpress.ui.dxMultiViewOptions): JQuery;
dxGallery(options?: DevExpress.ui.dxGalleryOptions): JQuery;
dxActionSheet(options?: DevExpress.ui.dxActionSheetOptions): JQuery;
dxDropDownMenu(options?: DevExpress.ui.dxDropDownMenuOptions): JQuery;
dxPanorama(options?: DevExpress.ui.dxPanoramaOptions): JQuery;
dxPivot(options?: DevExpress.ui.dxPivotOptions): JQuery;
dxSwitch(options?: DevExpress.ui.dxSwitchOptions): JQuery;
dxTileView(options?: DevExpress.ui.dxTileViewOptions): JQuery;
dxSlideOut(options?: DevExpress.ui.dxSlideOutOptions): JQuery;
dxDataGrid(options?: DevExpress.ui.dxDataGridOptions): JQuery;
dxMenu(options?: DevExpress.ui.dxMenuOptions): JQuery;
    dxContextMenu(options?: DevExpress.ui.dxContextMenuOptions): JQuery;
dxColorPicker(options?: DevExpress.ui.dxColorPickerOptions): JQuery;
dxChart(options?: DevExpress.viz.charts.ChartOptions): JQuery;
    dxChart(method: string, param1?:any, param2?:any): any;
    dxPieChart(options?: DevExpress.viz.charts.PieOptions): JQuery;
    dxPieChart(method: string, param1?: any, param2?: any): any;
    dxRangeSelector(options?: DevExpress.viz.rangeSelector.RangeSelectorOptions): JQuery;
    dxRangeSelector(method: string, param1?: any, param2?: any): any;
    dxCircularGauge(options?: DevExpress.viz.gauges.CircularGaugeOptions): JQuery;
    dxCircularGauge(method: string, param1?: any, param2?: any): any;
    dxLinearGauge(options?: DevExpress.viz.gauges.LinearGaugeOptions): JQuery;
    dxLinearGauge(method: string, param1?: any, param2?: any): any;
	dxBarGauge(options?: DevExpress.viz.gauges.BarGaugeOptions): JQuery;
	dxBarGauge(method: string, param1?: any, param2?: any): any;
    dxSparkline(options?: DevExpress.viz.sparklines.SparklineOptions): JQuery;
    dxSparkline(method: string, param1?: any, param2?: any): any;
    dxBullet(options?: DevExpress.viz.sparklines.BulletOptions): JQuery;
    dxBullet(method: string, param1?: any, param2?: any): any;
    dxVectorMap(options?: DevExpress.viz.map.VectorMapOptions): JQuery;
    dxVectorMap(method: string, param1?: any, param2?: any): any;
}