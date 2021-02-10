import { ViewState } from '../model/ViewState';
import { ElementMissing } from '../exceptions/errors';
import { GenesisViewModel } from '../model/ViewModel';

/**
 * Class with static methods to process the JSON style UI code and generate html and render.
 */
export class UI
{
	/**
   * Call this function with root view JSON of your app.
   * @param applicationView - JSON style view layout which defines the UI. It will be added inside html body tag.
   * @param elementId - Optionally provide a root element id to load the app into (instead of body tag).
   */
	static render (applicationView: ViewState, elementId?: string): GenesisViewModel
	{
		const root = elementId ? document.getElementById(elementId) : document.body;
		if (!root)
		{
			throw new ElementMissing(elementId ?? '');
		}
		// Clear element before loading app.
		root.innerHTML = '';

		const genesisViewModel = new GenesisViewModel(applicationView, root);
		return genesisViewModel;
	}
}
